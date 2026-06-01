<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public function sendOtp(string $email, string $rateLimitType, string $mailType, string $logPrefix): array
    {
        $rateLimit = PasswordResetOtp::checkRateLimit($email, $rateLimitType);
        if (!$rateLimit['allowed']) {
            return [
                'sent' => false,
                'status' => 429,
                'message' => $rateLimit['message'],
                'data' => [
                    'resendCooldownSeconds' => $rateLimit['cooldown'],
                ],
            ];
        }

        $otp = PasswordResetOtp::createForEmail($email);
        $user = User::where('email', $email)->first();
        $userName = $user ? $user->name : 'Pengguna KampusMarket';

        try {
            Mail::to($email)->send(new OtpMail(
                $otp->otp,
                $userName,
                $mailType,
                10
            ));

            Log::info($logPrefix . ' OTP sent', [
                'email' => $email,
                'otp_id' => $otp->id,
            ]);
        } catch (\Throwable $mailError) {
            Log::error($logPrefix . ' email failed', [
                'email' => $email,
                'otp_id' => $otp->id,
                'error' => $mailError->getMessage(),
            ]);

            return [
                'sent' => false,
                'status' => 500,
                'message' => 'Mohon maaf, kode OTP gagal dikirim. Silakan coba lagi dalam beberapa saat.',
            ];
        }

        return [
            'sent' => true,
            'cooldown' => PasswordResetOtp::recordOtpSent($email, $rateLimitType),
        ];
    }
}
