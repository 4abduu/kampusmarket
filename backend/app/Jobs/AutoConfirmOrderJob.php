<?php

namespace App\Jobs;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\WalletTransaction;
use App\Models\CodInvoice;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class AutoConfirmOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $orderUuid;

    public function __construct($orderUuid)
    {
        $this->orderUuid = $orderUuid;
    }

    public function handle(): void
    {
        $order = Order::where('uuid', $this->orderUuid)->first();
        if (!$order) return;

        // Validasi status. Hanya yg masih pending konfirmasi pembeli yg diproses.
        $completableStatuses = [OrderStatus::PROCESSING, OrderStatus::IN_DELIVERY, OrderStatus::READY_PICKUP];
        if (!in_array($order->status, $completableStatuses, true)) {
            return;
        }

        // Mark as completed
        $order->update([
            'status' => OrderStatus::COMPLETED,
            'completed_at' => now(),
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => OrderStatus::COMPLETED->value,
            'notes' => 'Pesanan dikonfirmasi otomatis oleh sistem (2 hari tanpa respon pembeli)',
            'actor_id' => null,
        ]);

        $order->product->incrementSoldCount($order->quantity);

        // ESCROW RELEASE untuk pembayaran digital
        if ($order->payment_status === PaymentStatus::PAID && in_array($order->payment_method, ['balance', 'midtrans'])) {
            $seller = $order->seller;
            $sellerBalanceBefore = $seller->wallet_balance;
            $seller->wallet_balance += $order->net_income;
            $seller->save();

            WalletTransaction::create([
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
                    'user_id' => $seller->id,
                    'type' => 'admin_fee',
                    'amount' => -$order->admin_fee_deducted,
                    'balance_before' => $sellerBalanceBefore + $order->net_income,
                    'balance_after' => $seller->wallet_balance,
                    'description' => 'Biaya admin otomatis (5%) pesanan ' . $order->order_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);
            }
        } elseif (in_array($order->payment_method, ['cod', 'cash']) && $order->admin_fee_deducted > 0) {
            // COD / Cash payment handling
            $seller = $order->seller;
            $commission = $order->admin_fee_deducted;
            
            if ($seller->wallet_balance >= $commission) {
                $sellerBalanceBefore = $seller->wallet_balance;
                $seller->wallet_balance -= $commission;
                $seller->save();

                WalletTransaction::create([
                    'user_id' => $seller->id,
                    'type' => 'cod_fee_deduction',
                    'amount' => -$commission,
                    'balance_before' => $sellerBalanceBefore,
                    'balance_after' => $seller->wallet_balance,
                    'description' => 'Potongan komisi otomatis pesanan ' . strtoupper($order->payment_method) . ' ' . $order->order_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);
            } else {
                $dueDate = Carbon::now()->addDays(7);
                $invoice = CodInvoice::create([
                    'uuid' => (string) Str::uuid(),
                    'user_id' => $seller->id,
                    'order_id' => $order->id,
                    'amount' => $commission,
                    'status' => 'unpaid',
                    'due_date' => $dueDate,
                ]);

                DebtReminderJob::dispatch($invoice->uuid)->delay($dueDate->copy()->subDays(2));
                CheckDebtExpirationJob::dispatch($invoice->uuid)->delay($dueDate);
            }
        }
    }
}
