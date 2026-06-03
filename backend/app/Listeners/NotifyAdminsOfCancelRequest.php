<?php

namespace App\Listeners;

use App\Events\CancelRequestCreated;
use App\Helpers\NotificationHelper;

class NotifyAdminsOfCancelRequest
{
    public function handle(CancelRequestCreated $event): void
    {
        $cancelRequest = $event->cancelRequest->loadMissing(['order', 'requester']);

        // Gunakan NotificationHelper agar format alasan, link, dan action_tab konsisten
        NotificationHelper::adminCancelRequest($cancelRequest);
    }
}
