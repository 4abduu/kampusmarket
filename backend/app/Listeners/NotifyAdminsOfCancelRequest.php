<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\CancelRequestCreated;
use App\Jobs\SendAdminNotification;

class NotifyAdminsOfCancelRequest
{
    public function handle(CancelRequestCreated $event): void
    {
        $cancelRequest = $event->cancelRequest->loadMissing(['order', 'requester']);

        SendAdminNotification::dispatch(
            type: NotificationType::ORDER->value,
            title: 'Permintaan Pembatalan Baru',
            message: $cancelRequest->requester->name . ' mengajukan pembatalan untuk pesanan ' . $cancelRequest->order->order_number . '.',
            link: '/admin',
            data: [
                'action_tab' => 'cancel-requests',
                'cancel_request_id' => $cancelRequest->uuid,
            ],
        );
    }
}
