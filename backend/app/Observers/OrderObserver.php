<?php

namespace App\Observers;

use App\Enums\OrderStatus;
use App\Models\Order;

class OrderObserver
{
    /**
     * Handle the Order "updated" event.
     *
     * Detect status transitions to/from 'completed' and adjust sold_count accordingly.
     */
    public function updated(Order $order): void
    {
        if (!$order->wasChanged('status')) {
            return;
        }

        $oldStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        // Normalize: getOriginal may return the raw string value (not the enum)
        $oldIsCompleted = $oldStatus === OrderStatus::COMPLETED
            || (is_string($oldStatus) && $oldStatus === OrderStatus::COMPLETED->value);

        $newIsCompleted = $newStatus === OrderStatus::COMPLETED
            || (is_string($newStatus) && $newStatus === OrderStatus::COMPLETED->value);

        if ($newIsCompleted && !$oldIsCompleted) {
            // Transitioned INTO completed → increment sold_count
            $order->product?->incrementSoldCount($order->quantity);
        } elseif ($oldIsCompleted && !$newIsCompleted) {
            // Transitioned OUT OF completed → decrement sold_count
            $order->product?->decrementSoldCount($order->quantity);
        }
    }
}
