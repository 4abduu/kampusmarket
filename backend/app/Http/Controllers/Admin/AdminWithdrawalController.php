<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Helpers\NotificationHelper;
use App\Models\Withdrawal;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Http\Resources\WithdrawalResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminWithdrawalController extends Controller
{
    use ApiResponse;

    /**
     * Get all withdrawals with pagination (Admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Withdrawal::with(['user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $withdrawals = $query->latest()->paginate($perPage);

        return $this->paginated(
            $withdrawals,
            WithdrawalResource::collection($withdrawals),
            'Withdrawals retrieved'
        );
    }

    /**
     * Approve withdrawal (Admin).
     */
    public function approve(string $id): JsonResponse
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

            // Notify user that withdrawal is approved and processing
            NotificationHelper::withdrawalPending($withdrawal->user_id, $withdrawal);

            $withdrawal->load('user');

            return $this->success(
                new WithdrawalResource($withdrawal),
                'Withdrawal disetujui'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal menyetujui withdrawal', null, $code);
        }
    }

    /**
     * Mark withdrawal as processing (Admin).
     */
    public function process(string $id): JsonResponse
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

            $withdrawal->load('user');

            return $this->success(
                new WithdrawalResource($withdrawal),
                'Withdrawal sedang diproses'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal memproses withdrawal', null, $code);
        }
    }

    /**
     * Reject withdrawal and refund user (Admin).
     */
    public function reject(string $id, Request $request): JsonResponse
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

            // Notify user that withdrawal was rejected
            NotificationHelper::withdrawalFailed($withdrawal->user_id, $withdrawal, $request->rejectionReason);

            $withdrawal->load('user');

            return $this->success(
                new WithdrawalResource($withdrawal),
                'Withdrawal ditolak dan dana dikembalikan'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal menolak withdrawal', null, $code);
        }
    }

    /**
     * Mark withdrawal as failed and refund user (Admin).
     */
    public function fail(string $id, Request $request): JsonResponse
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

                // Refund to user when payout fails
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

            // Notify user that withdrawal failed and funds were refunded
            NotificationHelper::withdrawalFailed($withdrawal->user_id, $withdrawal, $request->failureReason);

            $withdrawal->load('user');

            return $this->success(
                new WithdrawalResource($withdrawal),
                'Withdrawal gagal dan dana dikembalikan'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal menandai withdrawal sebagai gagal', null, $code);
        }
    }

    /**
     * Complete withdrawal (Admin).
     */
    public function complete(string $id): JsonResponse
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

            // Notify user that withdrawal completed successfully
            NotificationHelper::withdrawalSuccess($withdrawal->user_id, $withdrawal);

            $withdrawal->load('user');

            return $this->success(
                new WithdrawalResource($withdrawal),
                'Withdrawal selesai'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal menyelesaikan withdrawal', null, $code);
        }
    }

    /**
     * Get wallet top-ups statistics and list (Admin).
     * OPTIMIZED: Uses single selectRaw query for stats instead of 4 separate queries.
     */
    public function topUps(Request $request): JsonResponse
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

        // OPTIMIZED: Calculate statistics using single selectRaw query (1 query instead of 4)
        $stats = \App\Models\Payment::where('type', 'wallet_topup')
            ->selectRaw(
                'SUM(gross_amount) as total_amount, ' .
                'SUM(CASE WHEN status = "paid" THEN gross_amount ELSE 0 END) as successful_amount, ' .
                'SUM(CASE WHEN status = "pending" THEN gross_amount ELSE 0 END) as pending_amount, ' .
                'SUM(CASE WHEN status = "failed" THEN gross_amount ELSE 0 END) as failed_amount'
            )
            ->first();

        return $this->success([
            'topups' => $topups->items(),
            'stats' => [
                'total_amount' => (int) ($stats->total_amount ?? 0),
                'successful_amount' => (int) ($stats->successful_amount ?? 0),
                'pending_amount' => (int) ($stats->pending_amount ?? 0),
                'failed_amount' => (int) ($stats->failed_amount ?? 0),
            ],
            'meta' => [
                'current_page' => $topups->currentPage(),
                'last_page' => $topups->lastPage(),
                'per_page' => $topups->perPage(),
                'total' => $topups->total(),
            ]
        ], 'Top-ups retrieved');
    }
}
