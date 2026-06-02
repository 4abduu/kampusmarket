<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoCancelOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-cancel';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically cancel orders that are pending or waiting payment for more than 24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting auto-cancel orders process...');

        $threshold = Carbon::now()->subHours(24);

        // Find orders that are pending (from created_at) or waiting_payment (from updated_at) for more than 24 hours
        $ordersToCancel = Order::where(function ($query) use ($threshold) {
            $query->where('status', OrderStatus::PENDING)
                  ->where('created_at', '<', $threshold);
        })->orWhere(function ($query) use ($threshold) {
            $query->where('status', OrderStatus::WAITING_PAYMENT)
                  ->where('updated_at', '<', $threshold);
        })->get();

        $count = 0;

        foreach ($ordersToCancel as $order) {
            try {
                DB::transaction(function () use ($order) {
                    // Update status
                    $order->update([
                        'status' => OrderStatus::CANCELLED,
                        'cancel_reason' => 'Dibatalkan otomatis oleh sistem (melewati batas waktu 24 jam)',
                    ]);

                    // Add history
                    OrderHistory::create([
                        'order_id' => $order->id,
                        'status' => OrderStatus::CANCELLED->value,
                        'notes' => 'Dibatalkan otomatis oleh sistem (melewati batas waktu 24 jam)',
                        'actor_id' => null, // System action
                    ]);

                    // Refund stock
                    $product = $order->product;
                    if ($product) {
                        $product->updateStock($product->stock + $order->quantity);
                    }
                });

                $count++;
                $this->info("Cancelled order: {$order->order_number}");
            } catch (\Exception $e) {
                Log::error("Failed to auto-cancel order {$order->id}: " . $e->getMessage());
                $this->error("Failed to cancel order {$order->order_number}");
            }
        }

        $this->info("Completed. Cancelled {$count} orders.");
    }
}
