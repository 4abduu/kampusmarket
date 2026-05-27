<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
use App\Http\Helpers\CurrencyHelper;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
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

            // Notify all admins about the new withdrawal request
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    \App\Models\Notification::create([
                        'user_id' => $admin->id,
                        'type' => \App\Enums\NotificationType::WITHDRAWAL,
                        'title' => 'Permintaan Penarikan Dana Baru',
                        'message' => $request->user()->name . ' meminta penarikan dana sebesar Rp ' . number_format($withdrawal->amount, 0, ',', '.') . '.',
                        'link' => '/admin',
                        'data' => [
                            'action_tab' => 'finance',
                            'withdrawal_id' => $withdrawal->uuid,
                        ],
                        'is_read' => false,
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('[WalletController] Gagal membuat notifikasi admin', ['error' => $e->getMessage()]);
            }

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

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    /**
     * Get all withdrawals (Admin).
     */
    public function adminWithdrawals(Request $request): JsonResponse
    {
        $query = Withdrawal::with(['user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
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
     * Approve withdrawal (Admin).
     */
    public function approveWithdrawal(string $id): JsonResponse
    {
        try {
            $withdrawal = DB::transaction(function () use ($id) {
                $withdrawal = Withdrawal::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if (!$withdrawal->canBeProcessed()) {
                    throw new \Exception('Withdrawal tidak dapat diproses', 400);
                }

                $withdrawal->approve();

                return $withdrawal;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal disetujui',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menyetujui withdrawal',
            ], $code);
        }
    }

    /**
     * Mark withdrawal as processing (Admin).
     */
    public function processWithdrawal(string $id): JsonResponse
    {
        try {
            $withdrawal = DB::transaction(function () use ($id) {
                $withdrawal = Withdrawal::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if ($withdrawal->status->value !== 'approved') {
                    throw new \Exception('Withdrawal harus disetujui terlebih dahulu', 400);
                }

                $withdrawal->markAsProcessing();

                return $withdrawal;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal sedang diproses',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal memproses withdrawal',
            ], $code);
        }
    }

    /**
     * Reject withdrawal (Admin).
     */
    public function rejectWithdrawal(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'rejectionReason' => 'required|string|max:500',
        ]);

        try {
            $withdrawal = DB::transaction(function () use ($id, $request) {
                $withdrawal = Withdrawal::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if ($withdrawal->status->value !== 'pending') {
                    throw new \Exception('Withdrawal tidak dapat ditolak', 400);
                }

                // Refund to user
                $user = User::where('id', $withdrawal->user_id)->lockForUpdate()->firstOrFail();
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance += $withdrawal->amount;
                $user->save();

                // Create refund transaction
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'refund',
                    'amount' => $withdrawal->amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Refund from rejected withdrawal ' . $withdrawal->withdrawal_number,
                    'related_withdrawal_id' => $withdrawal->id,
                    'status' => 'completed',
                ]);

                $withdrawal->reject($request->rejectionReason);

                return $withdrawal;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal ditolak dan dana dikembalikan',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menolak withdrawal',
            ], $code);
        }
    }

    /**
     * Fail withdrawal and refund user (Admin).
     */
    public function failWithdrawal(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'failureReason' => 'required|string|max:500',
        ]);

        try {
            $withdrawal = DB::transaction(function () use ($id, $request) {
                $withdrawal = Withdrawal::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if (!in_array($withdrawal->status->value, ['approved', 'processing'])) {
                    throw new \Exception('Withdrawal tidak dapat ditandai gagal', 400);
                }

                // Refund to user when payout fails.
                $user = User::where('id', $withdrawal->user_id)->lockForUpdate()->firstOrFail();
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance += $withdrawal->amount;
                $user->save();

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'refund',
                    'amount' => $withdrawal->amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Refund from failed withdrawal ' . $withdrawal->withdrawal_number,
                    'related_withdrawal_id' => $withdrawal->id,
                    'status' => 'completed',
                ]);

                $withdrawal->markAsFailed($request->failureReason);

                WalletTransaction::where('related_withdrawal_id', $withdrawal->id)
                    ->where('type', 'withdrawal')
                    ->update(['status' => 'failed']);

                return $withdrawal;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal gagal dan dana dikembalikan',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menandai withdrawal sebagai gagal',
            ], $code);
        }
    }

    /**
     * Complete withdrawal (Admin).
     */
    public function completeWithdrawal(string $id): JsonResponse
    {
        try {
            $withdrawal = DB::transaction(function () use ($id) {
                $withdrawal = Withdrawal::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if (!in_array($withdrawal->status->value, ['approved', 'processing'])) {
                    throw new \Exception('Withdrawal tidak dapat diselesaikan', 400);
                }

                $withdrawal->markAsCompleted();

                // Update transaction status
                WalletTransaction::where('related_withdrawal_id', $withdrawal->id)
                    ->update(['status' => 'completed']);

                return $withdrawal;
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal selesai',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menyelesaikan withdrawal',
            ], $code);
        }
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

    /**
     * Get all wallet topups (Admin).
     */
    public function adminTopUps(Request $request): JsonResponse
    {
        $query = \App\Models\Payment::where('type', 'wallet_topup')->with(['user']);

        // Search by user name/email, transaction_id, or payment uuid
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('uuid', $search)
                  ->orWhere('transaction_id', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $query->latest();

        // Paginate
        $perPage = $request->get('per_page', 20);
        $topups = $query->paginate($perPage);

        // Calculate statistics (Rupiah totals, not counts)
        $totalAmount = \App\Models\Payment::where('type', 'wallet_topup')->sum('gross_amount');
        $successfulAmount = \App\Models\Payment::where('type', 'wallet_topup')->where('status', 'paid')->sum('gross_amount');
        $pendingAmount = \App\Models\Payment::where('type', 'wallet_topup')->where('status', 'pending')->sum('gross_amount');
        $failedAmount = \App\Models\Payment::where('type', 'wallet_topup')->where('status', 'failed')->sum('gross_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'topups' => $topups->items(),
                'stats' => [
                    'total_amount' => (int) $totalAmount,
                    'successful_amount' => (int) $successfulAmount,
                    'pending_amount' => (int) $pendingAmount,
                    'failed_amount' => (int) $failedAmount,
                ],
                'meta' => [
                    'current_page' => $topups->currentPage(),
                    'last_page' => $topups->lastPage(),
                    'per_page' => $topups->perPage(),
                    'total' => $topups->total(),
                ]
            ]
        ]);
    }
}
