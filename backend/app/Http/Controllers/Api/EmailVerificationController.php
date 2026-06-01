<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    public function __construct(private readonly OtpService $otpService)
    {
    }

    public function sendEmailVerificationOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            Log::info('Auth send email verification OTP requested', ['email' => $request->email]);

            $result = $this->otpService->sendOtp(
                $request->email,
                'verify_email',
                'email_verification',
                'Auth email verification'
            );

            if (!$result['sent']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    ...isset($result['data']) ? ['data' => $result['data']] : [],
                ], $result['status']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP verifikasi telah dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                    'resendCooldownSeconds' => $result['cooldown'],
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

    public function verifyEmailWithOtp(VerifyOtpRequest $request): JsonResponse
    {
        try {
            $record = PasswordResetOtp::verify($request->email, $request->otp);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
                ], 400);
            }

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

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

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
