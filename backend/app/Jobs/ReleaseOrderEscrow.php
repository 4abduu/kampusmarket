<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class ReleaseOrderEscrow implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     * Releases escrow to seller when order is completed by buyer.
     */
    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $order = Order::find($this->orderId);

            if (!$order) {
                throw new \Exception('Order not found');
            }

            // Only release if order is completed and payment is paid (escrow held)
            if ($order->status->value !== 'completed' || $order->payment_status->value !== 'paid') {
                return;
            }

            DB::transaction(function () use ($order) {
                $seller = $order->seller;

                if (!$seller) {
                    throw new \Exception('Seller not found');
                }

                // Release net_income to seller wallet
                $balanceBefore = $seller->wallet_balance;
                $seller->wallet_balance += $order->net_income;
                $seller->save();

                WalletTransaction::create([
                    'user_id' => $seller->id,
                    'type' => 'sale_income',
                    'amount' => $order->net_income,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $seller->wallet_balance,
                    'description' => 'Escrow released for completed order ' . $order->order_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);

                // Update order payment status
                $order->update(['payment_status' => 'released']);

                \Illuminate\Support\Facades\Log::info('Escrow released to seller', [
                    'order_id' => $order->id,
                    'seller_id' => $seller->id,
                    'amount' => $order->net_income,
                ]);
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to release escrow', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
            ]);
            // Rethrow to allow retry
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error('Release escrow job failed permanently', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
        ]);
    }
}
