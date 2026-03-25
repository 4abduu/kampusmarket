<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use App\Models\User;
use App\Http\Resources\WalletTransactionResource;
use App\Http\Resources\WithdrawalResource;
use App\Http\Requests\StoreWithdrawalRequest;
use App\Http\Requests\TopUpRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\CurrencyHelper;
use App\Http\Helpers\NumberGenerator;

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
                'balance' => (int) ($user->wallet_balance / 100), // Convert to Rupiah
                'pendingWithdrawal' => (int) (
                    Withdrawal::where('user_id', $user->id)
                        ->whereIn('status', ['pending', 'approved', 'processing'])
                        ->sum('amount') / 100
                ),
            ],
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
        $amountInCent = $request->amount * 100;

        // In production, this would integrate with payment gateway
        // For now, we'll simulate successful top-up

        $balanceBefore = $user->wallet_balance;
        $user->wallet_balance += $amountInCent;
        $user->save();

        $transaction = WalletTransaction::create([
            'uuid' => NumberGenerator::uuid(),
            'user_id' => $user->id,
            'type' => 'top_up',
            'amount' => $amountInCent,
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
                'newBalance' => (int) ($user->wallet_balance / 100),
            ],
        ]);
    }

    /**
     * Request withdrawal.
     */
    public function withdraw(StoreWithdrawalRequest $request): JsonResponse
    {
        $user = $request->user();
        $amountInCent = $request->amount * 100;

        // Check balance
        if ($user->wallet_balance < $amountInCent) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi',
            ], 400);
        }

        // Deduct from balance immediately
        $balanceBefore = $user->wallet_balance;
        $user->wallet_balance -= $amountInCent;
        $user->save();

        // Create withdrawal record
        $withdrawal = Withdrawal::create([
            'uuid' => NumberGenerator::uuid(),
            'withdrawal_number' => NumberGenerator::withdrawalNumber(),
            'user_id' => $user->id,
            'amount' => $amountInCent,
            'total_deduction' => 0, // No fee for now
            'account_type' => $request->accountType,
            'bank_name' => $request->bankName,
            'account_number' => $request->accountNumber,
            'account_name' => $request->accountName,
            'status' => 'pending',
        ]);

        // Create transaction record
        WalletTransaction::create([
            'uuid' => NumberGenerator::uuid(),
            'user_id' => $user->id,
            'type' => 'withdrawal',
            'amount' => -$amountInCent,
            'balance_before' => $balanceBefore,
            'balance_after' => $user->wallet_balance,
            'description' => 'Withdrawal to ' . $request->bankName . ' - ' . $request->accountNumber,
            'related_withdrawal_id' => $withdrawal->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan penarikan berhasil dibuat',
            'data' => new WithdrawalResource($withdrawal),
        ]);
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
        $withdrawal = Withdrawal::where('uuid', $id)->firstOrFail();

        if (!$withdrawal->canBeProcessed()) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal tidak dapat diproses',
            ], 400);
        }

        $withdrawal->approve();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal disetujui',
            'data' => new WithdrawalResource($withdrawal),
        ]);
    }

    /**
     * Reject withdrawal (Admin).
     */
    public function rejectWithdrawal(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'rejectionReason' => 'required|string|max:500',
        ]);

        $withdrawal = Withdrawal::where('uuid', $id)->firstOrFail();

        if ($withdrawal->status->value !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal tidak dapat ditolak',
            ], 400);
        }

        // Refund to user
        $user = $withdrawal->user;
        $balanceBefore = $user->wallet_balance;
        $user->wallet_balance += $withdrawal->amount;
        $user->save();

        // Create refund transaction
        WalletTransaction::create([
            'uuid' => NumberGenerator::uuid(),
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

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal ditolak dan dana dikembalikan',
            'data' => new WithdrawalResource($withdrawal),
        ]);
    }

    /**
     * Complete withdrawal (Admin).
     */
    public function completeWithdrawal(string $id): JsonResponse
    {
        $withdrawal = Withdrawal::where('uuid', $id)->firstOrFail();

        if (!in_array($withdrawal->status->value, ['approved', 'processing'])) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal tidak dapat diselesaikan',
            ], 400);
        }

        $withdrawal->markAsCompleted();

        // Update transaction status
        WalletTransaction::where('related_withdrawal_id', $withdrawal->id)
            ->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal selesai',
            'data' => new WithdrawalResource($withdrawal),
        ]);
    }
}
