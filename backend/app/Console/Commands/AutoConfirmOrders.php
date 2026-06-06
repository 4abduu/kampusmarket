<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\WalletTransaction;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Console\Command;

class AutoConfirmOrders extends Command
{
    protected $signature = 'orders:auto-confirm';
    protected $description = 'Auto-confirm orders where buyer has not confirmed within 3 days after seller delivery';

    public function handle(): int
    {
        $orders = Order::whereNotNull('auto_confirm_deadline')
            ->where('auto_confirm_deadline', '<=', now())
            ->whereNotIn('status', [
                OrderStatus::COMPLETED,
                OrderStatus::CANCELLED,
            ])
            ->get();

        $count = 0;

        foreach ($orders as $order) {
            // Mark as completed
            $order->update([
                'status' => OrderStatus::COMPLETED,
                'completed_at' => now(),
            ]);

            OrderHistory::create([
                'uuid' => NumberGenerator::uuid(),
                'order_id' => $order->id,
                'status' => OrderStatus::COMPLETED->value,
                'notes' => 'Pesanan dikonfirmasi otomatis oleh sistem (3 hari tanpa respon pembeli)',
                'actor_id' => null,
            ]);


            // ESCROW RELEASE for digital payments
            if ($order->payment_status === PaymentStatus::PAID) {
                $seller = $order->seller;
                $sellerBalanceBefore = $seller->wallet_balance;
                $seller->wallet_balance += $order->net_income;
                $seller->save();

                WalletTransaction::create([
                    'uuid' => NumberGenerator::uuid(),
                    'user_id' => $seller->id,
                    'type' => 'income',
                    'amount' => $order->net_income,
                    'balance_before' => $sellerBalanceBefore,
                    'balance_after' => $seller->wallet_balance,
                    'description' => 'Pencairan escrow otomatis pesanan ' . $order->order_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);

                if ($order->admin_fee_deducted > 0) {
                    WalletTransaction::create([
                        'uuid' => NumberGenerator::uuid(),
                        'user_id' => $seller->id,
                        'type' => 'admin_fee',
                        'amount' => -$order->admin_fee_deducted,
                        'balance_before' => $sellerBalanceBefore + $order->net_income,
                        'balance_after' => $seller->wallet_balance,
                        'description' => 'Biaya admin (5%) pesanan ' . $order->order_number,
                        'related_order_id' => $order->id,
                        'status' => 'completed',
                    ]);
                }
            }

            $count++;
        }

        $this->info("Auto-confirmed {$count} orders.");
        return Command::SUCCESS;
    }
}
