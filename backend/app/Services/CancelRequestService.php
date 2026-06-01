<?php

namespace App\Services;

use App\Models\CancelRequest;
use App\Models\Order;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class CancelRequestService
{
    public function approve(string $id, int|string $adminId, ?int $refundAmount, ?string $adminNotes): CancelRequest
    {
        return DB::transaction(function () use ($id, $adminId, $refundAmount, $adminNotes) {
            $cancelRequest = CancelRequest::where('uuid', $id)->lockForUpdate()->firstOrFail();

            if (!$cancelRequest->canBeProcessed()) {
                throw new \Exception('Permintaan tidak dapat diproses', 400);
            }

            $refundAmount = $refundAmount ?: $cancelRequest->order->total_price;

            $cancelRequest->approve($refundAmount, $adminNotes);

            $order = Order::where('id', $cancelRequest->order_id)->lockForUpdate()->firstOrFail();
            $order->cancel('Cancelled by admin due to cancel request', $adminId);

            $product = $order->product()->lockForUpdate()->firstOrFail();
            $product->increment('stock', $order->quantity);

            if ($order->payment_status->value === 'paid' && $refundAmount > 0) {
                $buyer = User::where('id', $order->buyer_id)->lockForUpdate()->firstOrFail();
                $balanceBefore = $buyer->wallet_balance;
                $buyer->wallet_balance += $refundAmount;
                $buyer->save();

                WalletTransaction::create([
                    'user_id' => $buyer->id,
                    'type' => 'refund',
                    'amount' => $refundAmount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $buyer->wallet_balance,
                    'description' => 'Refund from approved cancel request ' . $cancelRequest->request_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);

                $cancelRequest->markRefundProcessed();
                $order->update(['payment_status' => 'refunded']);
            }

            return $cancelRequest;
        });
    }

    public function reject(string $id, string $rejectionReason, ?string $adminNotes): CancelRequest
    {
        return DB::transaction(function () use ($id, $rejectionReason, $adminNotes) {
            $cancelRequest = CancelRequest::where('uuid', $id)->lockForUpdate()->firstOrFail();

            if (!$cancelRequest->canBeProcessed()) {
                throw new \Exception('Permintaan tidak dapat diproses', 400);
            }

            $cancelRequest->reject($rejectionReason, $adminNotes);

            return $cancelRequest;
        });
    }
}
