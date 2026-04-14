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
use App\Http\Helpers\NumberGenerator;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
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
            'is_customer_only' => $request->isCustomerOnly ?? false,
            // 'joined_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => new UserResource($user->load('faculty')),
                'token' => $token,
                'tokenType' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        if ($user->is_banned) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => new UserResource($user->load('faculty')),
                'token' => $token,
                'tokenType' => 'Bearer',
            ],
        ]);
    }

    /**
     * Google OAuth login/register.
     */
    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
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
                'is_customer_only' => $request->boolean('isCustomerOnly', false),
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
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dibanned: ' . $user->ban_reason,
            ], 403);
        }

        $needsFacultySelection = !$user->faculty_id;
        $token = $user->createToken('auth_token')->plainTextToken;

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
    }

    /**
     * Complete Google onboarding by setting faculty.
     */
    public function completeGoogleFaculty(CompleteGoogleFacultyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Autentikasi diperlukan',
            ], 401);
        }

        if ($user->faculty_id) {
            return response()->json([
                'success' => true,
                'message' => 'Fakultas sudah terhubung pada akun ini',
                'data' => new UserResource($user->load('faculty')),
            ]);
        }

        $faculty = Faculty::where('code', $request->facultyId)->firstOrFail();

        $user->update([
            'faculty_id' => $faculty->id,
            'is_customer_only' => $request->boolean('isCustomerOnly', $user->is_customer_only),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil disimpan',
            'data' => new UserResource($user->fresh(['faculty'])),
        ]);
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
        $otp = PasswordResetOtp::createForEmail($request->email);

        // In production, send OTP via email
        // For now, we'll return it in response for testing
        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email Anda',
            'data' => [
                'otp' => $otp->otp, // Remove this in production
            ],
        ]);
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
