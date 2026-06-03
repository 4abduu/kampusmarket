<?php

namespace App\Jobs;

use App\Enums\NotificationType;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SendAdminNotification
 *
 * Mengirim notifikasi ke seluruh admin secara async (queue).
 * Menggantikan loop foreach sinkron di berbagai controller.
 *
 * Params:
 *   $type    — NotificationType enum value (string)
 *   $title   — judul notifikasi
 *   $message — isi pesan notifikasi
 *   $link    — URL tujuan (default: '/admin')
 *   $data    — array data tambahan (misal action_tab, entity_id)
 */
class SendAdminNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $type,
        public readonly string $title,
        public readonly string $message,
        public readonly string $link = '/admin',
        public readonly array $data = [],
    ) {
    }

    public function handle(): void
    {
        try {
            app(NotificationService::class)->sendToAdmins(
                type: $this->type,
                title: $this->title,
                message: $this->message,
                link: $this->link,
                data: $this->data,
            );
        } catch (\Throwable $e) {
            Log::error('[SendAdminNotification] Gagal mengirim notifikasi admin', [
                'title' => $this->title,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[SendAdminNotification] Job gagal permanen', [
            'title' => $this->title,
            'error' => $exception->getMessage(),
        ]);
    }
}
