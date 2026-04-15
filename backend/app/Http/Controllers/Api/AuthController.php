<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Faculty;
use App\Models\PasswordResetOtp;
use App\Http\Resources\UserResource;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\GoogleLoginRequest;
use App\Http\Requests\CompleteGoogleFacultyRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Http\Helpers\NumberGenerator;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            Log::info('Auth register attempt', [
                'email' => $request->email,
                'facultyId' => $request->facultyId,
            ]);

            $faculty = null;
            if ($request->facultyId) {
                $faculty = Faculty::where('code', $request->facultyId)->first();
            }

            $user = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'faculty_id' => $faculty?->id,
                // 'joined_at' => now(),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth register success', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Auth register failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            Log::info('Auth login attempt', ['email' => $request->email]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Auth login failed: invalid credentials', ['email' => $request->email]);

                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah',
                ], 401);
            }

            if ($user->is_banned) {
                Log::warning('Auth login blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth login success', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth login failed with exception', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Google OAuth login/register.
     */
    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
        try {
            Log::info('Auth Google login attempt', [
                'email' => $request->email,
                'googleId' => $request->googleId,
            ]);

            $user = User::with('faculty')
                ->where('google_id', $request->googleId)
                ->orWhere('email', $request->email)
                ->first();

            $isNewUser = false;

            if (!$user) {
                $user = User::create([
                    'uuid' => NumberGenerator::uuid(),
                    'name' => $request->name,
                    'email' => $request->email,
                    'google_id' => $request->googleId,
                    'avatar' => $request->avatar,
                    'is_verified' => true,
                    'email_verified_at' => now(),
                ]);

                $isNewUser = true;
            } elseif (!$user->google_id) {
                $user->update([
                    'google_id' => $request->googleId,
                    'avatar' => $request->avatar ?? $user->avatar,
                    'is_verified' => true,
                ]);
            }

            if ($user->is_banned) {
                Log::warning('Auth Google login blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
                ], 403);
            }

            $needsFacultySelection = !$user->faculty_id;
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Auth Google login success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'needs_faculty_selection' => $needsFacultySelection,
            ]);

            return response()->json([
                'success' => true,
                'message' => $needsFacultySelection
                    ? 'Pilih fakultas untuk menyelesaikan pendaftaran'
                    : 'Login berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                    'requiresFacultySelection' => $needsFacultySelection,
                    'nextStep' => $needsFacultySelection ? 'faculty-selection' : 'home',
                    'isNewUser' => $isNewUser,
                ],
            ], $needsFacultySelection ? 202 : 200);
        } catch (\Throwable $e) {
            Log::error('Auth Google login failed with exception', [
                'email' => $request->email,
                'googleId' => $request->googleId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Redirect user to Google's OAuth consent screen.
     */
    public function googleRedirect()
    {
        Log::info('Auth Google redirect started');

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    /**
     * Google OAuth callback - Handle redirect from Google.
     */
    public function googleCallback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');
        
        if (!$code) {
            Log::warning('Auth Google callback called without code', [
                'state' => $state,
            ]);

            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=no_code');
        }

        try {
            Log::info('Auth Google callback received code', [
                'state' => $state,
            ]);

            // Exchange authorization code for access token
            $tokenResponse = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.google.redirect_uri'),
            ]);

            $tokenData = $tokenResponse->json();

            if (!isset($tokenData['access_token'])) {
                Log::error('Auth Google callback failed to obtain access token', [
                    'state' => $state,
                    'response' => $tokenData,
                ]);

                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=invalid_token');
            }

            // Get user info from Google
            $userResponse = Http::withToken($tokenData['access_token'])
                ->get('https://www.googleapis.com/oauth2/v2/userinfo');

            if (!$userResponse->successful()) {
                Log::error('Auth Google callback failed to get user info', [
                    'state' => $state,
                    'status' => $userResponse->status(),
                ]);

                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=failed_to_get_user');
            }

            $googleUser = $userResponse->json();

            // Login/register user
            $user = User::with('faculty')
                ->where('google_id', $googleUser['id'])
                ->orWhere('email', $googleUser['email'])
                ->first();

            $isNewUser = false;

            if (!$user) {
                $user = User::create([
                    'uuid' => NumberGenerator::uuid(),
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'google_id' => $googleUser['id'],
                    'avatar' => $googleUser['picture'] ?? null,
                    'is_verified' => true,
                    'email_verified_at' => now(),
                ]);

                $isNewUser = true;
            } elseif (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser['id'],
                    'avatar' => $googleUser['picture'] ?? $user->avatar,
                    'is_verified' => true,
                ]);
            }

            if ($user->is_banned) {
                Log::warning('Auth Google callback blocked: banned user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ban_reason' => $user->ban_reason,
                ]);

                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=banned&reason=' . urlencode($user->ban_reason));
            }

            // Create authentication token
            $token = $user->createToken('auth_token')->plainTextToken;
            $needsFacultySelection = !$user->faculty_id;

            // Build query parameters for redirect
            $queryParams = http_build_query([
                'token' => $token,
                'tokenType' => 'Bearer',
                'requiresFacultySelection' => $needsFacultySelection ? 'true' : 'false',
                'isNewUser' => $isNewUser ? 'true' : 'false',
                'userId' => $user->uuid,
                'userName' => $user->name,
            ]);

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $redirectPath = $needsFacultySelection ? '/faculty-selection' : '/dashboard';

            Log::info('Auth Google callback success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'needs_faculty_selection' => $needsFacultySelection,
            ]);

            return redirect("$frontendUrl$redirectPath?$queryParams");
        } catch (\Exception $e) {
            Log::error('Auth Google callback failed with exception', [
                'state' => $state,
                'error' => $e->getMessage(),
            ]);

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect("$frontendUrl/login?error=" . urlencode($e->getMessage()));
        }
    }

    /**
     * Complete Google onboarding by setting faculty.
     */
    public function completeGoogleFaculty(CompleteGoogleFacultyRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('Auth Google faculty completion rejected: unauthenticated');

                return response()->json([
                    'success' => false,
                    'message' => 'Autentikasi diperlukan',
                ], 401);
            }

            if ($user->faculty_id) {
                Log::info('Auth Google faculty completion skipped: already linked', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Fakultas sudah terhubung pada akun ini',
                    'data' => new UserResource($user->load('faculty')),
                ]);
            }

            $faculty = Faculty::where('code', $request->facultyId)->firstOrFail();

            $user->update([
                'faculty_id' => $faculty->id,
            ]);

            Log::info('Auth Google faculty completion success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'faculty_id' => $faculty->code,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fakultas berhasil disimpan',
                'data' => new UserResource($user->fresh(['faculty'])),
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth Google faculty completion failed', [
                'user_id' => $request->user()?->id,
                'facultyId' => $request->facultyId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()->load(['faculty', 'addresses'])),
        ]);
    }

    /**
     * Send password reset OTP.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            Log::info('Auth forgot password requested', ['email' => $request->email]);

            $otp = PasswordResetOtp::createForEmail($request->email);

            // In production, send OTP via email
            // For now, we'll return it in response for testing
            Log::info('Auth forgot password OTP created', ['email' => $request->email]);

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'data' => [
                    'otp' => $otp->otp, // Remove this in production
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth forgot password failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Verify OTP.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $record = PasswordResetOtp::verify($request->email, $request->otp);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP valid',
            'data' => [
                'verified' => true,
                'email' => $request->email,
            ],
        ]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = PasswordResetOtp::verify($request->email, $request->otp);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $record->markAsUsed();

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset',
        ]);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'facultyId' => 'nullable|string|exists:faculties,code',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
        ]);

        $data = $request->only(['name', 'phone', 'location', 'bio', 'avatar']);

        if ($request->facultyId) {
            $faculty = Faculty::where('code', $request->facultyId)->first();
            $data['faculty_id'] = $faculty?->id;
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => new UserResource($user->fresh(['faculty'])),
        ]);
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'currentPassword' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini salah',
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke all tokens except current
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui',
        ]);
    }

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        // In production, verify OTP sent to email
        // For now, just mark as verified

        $user = $request->user();
        $user->update([
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi',
        ]);
    }
}
