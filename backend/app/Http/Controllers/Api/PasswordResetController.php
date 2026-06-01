<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ManagesAuthCookies;
use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    use ManagesAuthCookies;

    public function __construct(private readonly OtpService $otpService)
    {
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            Log::info('Auth forgot password requested', ['email' => $request->email]);

            $result = $this->otpService->sendOtp(
                $request->email,
                'forgot_password',
                'forgot_password',
                'Auth forgot password'
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
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'data' => [
                    'email' => $request->email,
                    'resendCooldownSeconds' => $result['cooldown'],
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

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
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
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = response()->json([
            'success' => true,
            'message' => 'Password berhasil direset',
            'data' => [
                'user' => new UserResource($user->load('faculty')),
                'token' => $token,
                'tokenType' => 'Bearer',
            ],
        ]);

        return $this->attachAuthCookies($response, $token, false, false);
    }
}
