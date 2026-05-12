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
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use App\Http\Helpers\NumberGenerator;
use App\Mail\OtpMail;

class AuthController extends Controller
{
    private function getAuthCookieConfig(): array
    {
        $isSecure = config('app.env') === 'production';
        $cookieDomain = config('app.env') === 'production' ? env('COOKIE_DOMAIN', 'localhost') : 'localhost';

        return [$cookieDomain, $isSecure];
    }

    private function attachAuthCookies($response, string $token, bool $needsFacultySelection, bool $isNewUser = false)
    {
        [$cookieDomain, $isSecure] = $this->getAuthCookieConfig();

        $response->cookie('authToken', $token, 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, 'Lax');
        $response->cookie('requiresFacultySelection', $needsFacultySelection ? 'true' : 'false', 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, 'Lax');
        $response->cookie('isNewUser', $isNewUser ? 'true' : 'false', 60 * 24 * 7, '/', $cookieDomain, $isSecure, true, false, 'Lax');

        return $response;
    }

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
                $faculty = Faculty::visible()->where('code', $request->facultyId)->firstOrFail();
            }

            $user = User::create([
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
                'has_faculty' => $user->faculty_id ? 'yes' : 'no',
                'faculty_id' => $user->faculty_id,
            ]);

            $response = response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ], 201);
            return $this->attachAuthCookies($response, $token, false, false);
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
                'has_faculty' => $user->faculty_id ? 'yes' : 'no',
                'faculty_id' => $user->faculty_id,
            ]);

            $response = response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => new UserResource($user->load('faculty')),
                    'token' => $token,
                    'tokenType' => 'Bearer',
                ],
            ]);
            return $this->attachAuthCookies($response, $token, false, false);
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

            $response = response()->json([
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
            return $this->attachAuthCookies($response, $token, $needsFacultySelection, $isNewUser);
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
            $tokenResponse = Http::withoutVerifying()
                ->post('https://oauth2.googleapis.com/token', [
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
            $userResponse = Http::withoutVerifying()
                ->withToken($tokenData['access_token'])
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

            Log::info('Auth Google callback success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new_user' => $isNewUser,
                'needs_faculty_selection' => $needsFacultySelection,
                'has_faculty_id' => $user->faculty_id ? 'yes' : 'no',
            ]);

            // [PROTECTION #1B] Backend always validates faculty requirement
            // Build redirect URL with query parameters for frontend to handle faculty selection
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            
            // Always redirect through faculty-selection endpoint which will handle routing
            // If user already has faculty, the endpoint will redirect to home
            // If user doesn't have faculty, the endpoint will show faculty selection UI
            $redirectPath = $needsFacultySelection ? '/faculty-selection' : '/';
            
            $query = http_build_query([
                'requiresFacultySelection' => $needsFacultySelection ? 'true' : 'false',
                'isNewUser' => $isNewUser ? 'true' : 'false',
                'userName' => $user->name,
                'userEmail' => $user->email,
            ]);
            
            $redirectUrl = $frontendUrl . $redirectPath;
            if ($needsFacultySelection) {
                $redirectUrl .= '?' . $query;
            }
            
            Log::info('Auth Google callback redirect', [
                'user_id' => $user->id,
                'redirect_url' => $redirectUrl,
                'needs_faculty' => $needsFacultySelection,
            ]);
            
            // Set HttpOnly cookies
            $response = redirect($redirectUrl);
            return $this->attachAuthCookies($response, $token, $needsFacultySelection, $isNewUser);
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

            $faculty = Faculty::visible()->where('code', $request->facultyId)->firstOrFail();

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
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        // Determine cookie settings
        $isSecure = config('app.env') === 'production';
        $cookieDomain = config('app.env') === 'production' ? env('COOKIE_DOMAIN', 'localhost') : 'localhost';

        // Clear auth cookies by setting them with empty value and immediate expiry
        $response = response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);

        // Clear authToken cookie
        $response->cookie(
            'authToken',
            '',
            -1, // Expired
            '/',
            $cookieDomain,
            $isSecure,
            true,
            false,
            'Lax'
        );

        // Clear requiresFacultySelection cookie
        $response->cookie(
            'requiresFacultySelection',
            '',
            -1,
            '/',
            $cookieDomain,
            $isSecure,
            true,
            false,
            'Lax'
        );

        // Clear isNewUser cookie
        $response->cookie(
            'isNewUser',
            '',
            -1,
            '/',
            $cookieDomain,
            $isSecure,
            true,
            false,
            'Lax'
        );

        return $response;
    }

    /**
     * Get current authenticated user.
     * Used by frontend to check login status and restore session after page reload.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            Log::debug('Auth /me endpoint called without authenticated user', [
                'has_auth_header' => $request->header('Authorization') ? 'yes' : 'no',
                'has_cookie' => $request->hasCookie('authToken') ? 'yes' : 'no',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        if ($user->is_banned) {
            $user->currentAccessToken()->delete();
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
            ], 403);
        }

        // [PROTECTION #1C] Log faculty status on every auth check
        Log::debug('Auth /me endpoint success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'has_faculty' => $user->faculty_id ? 'yes' : 'no',
            'faculty_id' => $user->faculty_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user->load(['faculty', 'addresses'])),
        ]);
    }

    /**
     * Check user completion status (email verification and faculty selection).
     */
    public function checkCompletion(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'userId' => $user->uuid,
                'email' => $user->email,
                'isEmailVerified' => (bool) $user->is_verified,
                'emailVerifiedAt' => $user->email_verified_at,
                'hasFaculty' => (bool) $user->faculty_id,
                'facultyId' => $user->faculty_id,
                'requiresEmailVerification' => !$user->is_verified && !$user->google_id,
                'requiresFacultySelection' => !$user->faculty_id,
                'isComplete' => $user->is_verified && $user->faculty_id,
            ],
        ]);
    }

    /**
     * Send password reset OTP.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            Log::info('Auth forgot password requested', ['email' => $request->email]);

            // Create OTP
            $otp = PasswordResetOtp::createForEmail($request->email);

            // Get user name for email
            $user = User::where('email', $request->email)->first();
            $userName = $user ? $user->name : 'Pengguna KampusMarket';

            // Send email
            try {
                Mail::to($request->email)->send(new OtpMail(
                    $otp->otp,
                    $userName,
                    'forgot_password',
                    10
                ));

                Log::info('Auth forgot password OTP sent', [
                    'email' => $request->email,
                    'otp_id' => $otp->id,
                ]);
            } catch (\Throwable $mailError) {
                Log::error('Auth forgot password email failed', [
                    'email' => $request->email,
                    'otp_id' => $otp->id,
                    'error' => $mailError->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Mohon maaf, kode OTP gagal dikirim. Silakan coba lagi dalam beberapa saat.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth forgot password failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, terjadi kesalahan. Silakan coba lagi.',
            ], 500);
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
            'facultyId' => [
                'nullable',
                'string',
                Rule::exists('faculties', 'code')
                    ->where(fn ($query) => $query->where('is_active', true)->where('code', '!=', 'admin')),
            ],
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
        ]);

        $data = $request->only(['name', 'phone', 'location', 'bio', 'avatar']);

        if ($user->role?->value === 'admin') {
            $data['faculty_id'] = null;
        } elseif ($request->facultyId) {
            $faculty = Faculty::visible()->where('code', $request->facultyId)->firstOrFail();
            $data['faculty_id'] = $faculty->id;
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
     * Send email verification OTP.
     */
    public function sendEmailVerificationOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            Log::info('Auth send email verification OTP requested', ['email' => $request->email]);

            // Create OTP
            $otp = PasswordResetOtp::createForEmail($request->email);

            // Get user name or use email
            $user = User::where('email', $request->email)->first();
            $userName = $user ? $user->name : 'Pengguna KampusMarket';

            // Send email
            try {
                Mail::to($request->email)->send(new OtpMail(
                    $otp->otp,
                    $userName,
                    'email_verification',
                    10
                ));

                Log::info('Auth email verification OTP sent', [
                    'email' => $request->email,
                    'otp_id' => $otp->id,
                ]);
            } catch (\Throwable $mailError) {
                Log::error('Auth email verification email failed', [
                    'email' => $request->email,
                    'otp_id' => $otp->id,
                    'error' => $mailError->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Mohon maaf, kode OTP gagal dikirim. Silakan coba lagi dalam beberapa saat.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP verifikasi telah dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth send email verification OTP failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, terjadi kesalahan. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Verify email with OTP.
     */
    public function verifyEmailWithOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        try {
            // Verify OTP
            $record = PasswordResetOtp::verify($request->email, $request->otp);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
                ], 400);
            }

            // Find user and mark as verified
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak ditemukan',
                ], 404);
            }

            $user->update([
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);

            $record->markAsUsed();

            Log::info('Auth email verified', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email berhasil diverifikasi',
                'data' => new UserResource($user->load('faculty')),
            ]);
        } catch (\Throwable $e) {
            Log::error('Auth verify email with OTP failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Verify email (legacy - kept for backward compatibility).
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
