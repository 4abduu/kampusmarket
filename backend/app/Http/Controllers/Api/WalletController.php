<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use App\Models\User;
use App\Models\PasswordResetOtp;
use App\Http\Resources\WalletTransactionResource;
use App\Http\Resources\WithdrawalResource;
use App\Http\Requests\StoreWithdrawalRequest;
use App\Http\Requests\TopUpRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    use ApiResponse;

    /**
     * Get wallet balance.
     */
    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => (int) $user->wallet_balance,
                'pendingWithdrawal' => (int) (
                    Withdrawal::where('user_id', $user->id)
                        ->whereIn('status', ['pending', 'approved', 'processing'])
                        ->sum('amount')
                ),
                'hasPin' => !is_null($user->wallet_pin),
            ],
        ]);
    }

    /**
     * Set or update wallet PIN.
     */
    public function setPin(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => 'required|string|size:6|regex:/^[0-9]+$/',
        ]);

        $user = $request->user();
        $user->wallet_pin = Hash::make($request->pin);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'PIN Wallet berhasil diatur',
        ]);
    }

    /**
     * Get transaction history.
     */
    public function transactions(Request $request): JsonResponse
    {
        $query = WalletTransaction::with(['relatedOrder', 'relatedWithdrawal'])
            ->where('user_id', $request->user()->id);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to . ' 23:59:59');
        }

        $perPage = $request->get('per_page', 20);
        $transactions = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => WalletTransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Top up wallet.
     */
    public function topUp(TopUpRequest $request): JsonResponse
    {
        $user = $request->user();
        $amount = $request->amount;

        // In production, this would integrate with payment gateway
        // For now, we'll simulate successful top-up

        $balanceBefore = $user->wallet_balance;
        $user->wallet_balance += $amount;
        $user->save();

        $transaction = WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'top_up',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $user->wallet_balance,
            'description' => 'Top up via ' . $request->paymentMethod,
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Top up berhasil',
            'data' => [
                'transaction' => new WalletTransactionResource($transaction),
                'newBalance' => (int) $user->wallet_balance,
            ],
        ]);
    }

    /**
     * Request withdrawal.
     */
    public function withdraw(StoreWithdrawalRequest $request): JsonResponse
    {
        try {
            $withdrawal = DB::transaction(function () use ($request) {
                // Lock the user record to prevent race conditions on balance deduction
                $user = User::where('id', $request->user()->id)->lockForUpdate()->firstOrFail();
                $amount = $request->amount;

                // Check balance
                if ($user->wallet_balance < $amount) {
                    throw new \Exception('Saldo tidak mencukupi', 400);
                }

                // Deduct from balance immediately
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance -= $amount;
                $user->save();

                // Create withdrawal record
                $withdrawal = Withdrawal::create([
                    'withdrawal_number' => NumberGenerator::withdrawalNumber(),
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'total_deduction' => 0, // No fee for now
                    'account_type' => $request->accountType,
                    'bank_name' => $request->bankName,
                    'account_number' => $request->accountNumber,
                    'account_name' => $request->accountName,
                    'status' => 'pending',
                ]);

                // Create transaction record
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'withdrawal',
                    'amount' => -$amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Withdrawal to ' . $request->bankName . ' - ' . $request->accountNumber,
                    'related_withdrawal_id' => $withdrawal->id,
                    'status' => 'pending',
                ]);

                return $withdrawal;
            });

            // Notify all admins about the new withdrawal request (async via queue)
            \App\Jobs\SendAdminNotification::dispatch(
                type:    \App\Enums\NotificationType::WITHDRAWAL->value,
                title:   'Permintaan Penarikan Dana Baru',
                message: $request->user()->name . ' meminta penarikan dana sebesar Rp ' . number_format($withdrawal->amount, 0, ',', '.') . '.',
                link:    '/admin',
                data:    [
                    'action_tab'    => 'finance',
                    'withdrawal_id' => $withdrawal->uuid,
                ],
            );

            return response()->json([
                'success' => true,
                'message' => 'Permintaan penarikan berhasil dibuat',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal mengajukan penarikan dana',
            ], $code);
        }
    }

    /**
     * Get withdrawal history.
     */
    public function withdrawals(Request $request): JsonResponse
    {
        $query = Withdrawal::where('user_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $withdrawals = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => WithdrawalResource::collection($withdrawals),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
                'total' => $withdrawals->total(),
            ],
        ]);
    }

    /**
     * Get withdrawal detail.
     */
    public function withdrawalDetail(string $id, Request $request): JsonResponse
    {
        $withdrawal = Withdrawal::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new WithdrawalResource($withdrawal),
        ]);
    }

    /**
     * Send forgot PIN OTP to authenticated user's email.
     */
    public function forgotPin(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $rateLimit = PasswordResetOtp::checkRateLimit($user->email, 'forgot_pin');
            if (!$rateLimit['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $rateLimit['message'],
                    'data' => [
                        'resendCooldownSeconds' => $rateLimit['cooldown']
                    ]
                ], 429);
            }

            Log::info('Wallet forgot PIN requested', ['user_id' => $user->id, 'email' => $user->email]);

            // Create OTP
            $otp = PasswordResetOtp::createForEmail($user->email);

            // Send email
            try {
                Mail::to($user->email)->send(new OtpMail(
                    $otp->otp,
                    $user->name,
                    'forgot_pin',
                    10
                ));

                Log::info('Wallet forgot PIN OTP sent', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'otp_id' => $otp->id,
                ]);
            } catch (\Throwable $mailError) {
                Log::error('Wallet forgot PIN email failed', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'otp_id' => $otp->id,
                    'error' => $mailError->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Mohon maaf, kode OTP gagal dikirim. Silakan coba lagi dalam beberapa saat.',
                ], 500);
            }

            $nextCooldown = PasswordResetOtp::recordOtpSent($user->email, 'forgot_pin');

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'data' => [
                    'email' => $user->email,
                    'resendCooldownSeconds' => $nextCooldown,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Wallet forgot PIN failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, terjadi kesalahan. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Verify wallet PIN OTP without consuming it.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        try {
            $user = $request->user();

            $record = PasswordResetOtp::verify($user->email, $request->otp);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP valid',
            ]);
        } catch (\Throwable $e) {
            Log::error('Wallet verify OTP failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi OTP.',
            ], 500);
        }
    }

    /**
     * Reset wallet PIN after OTP verification.
     */
    public function resetPin(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
            'pin' => 'required|string|size:6|regex:/^[0-9]+$/',
        ]);

        try {
            $user = $request->user();

            // Verify OTP
            $record = PasswordResetOtp::verify($user->email, $request->otp);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa',
                ], 400);
            }

            // Update PIN
            $user->wallet_pin = Hash::make($request->pin);
            $user->save();

            // Mark OTP as used
            $record->markAsUsed();

            Log::info('Wallet PIN reset successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'otp_id' => $record->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PIN Wallet berhasil direset',
            ]);
        } catch (\Throwable $e) {
            Log::error('Wallet PIN reset failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Mohon maaf, terjadi kesalahan. Silakan coba lagi.',
            ], 500);
        }
    }
}
