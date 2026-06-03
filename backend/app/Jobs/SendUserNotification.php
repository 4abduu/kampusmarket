<?php

namespace App\Jobs;

use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SendUserNotification
 *
 * Mengirim notifikasi ke satu user secara async (queue).
 * Dipakai untuk notifikasi yang tidak berkaitan langsung
 * dengan Order atau Review (yang sudah punya job sendiri).
 *
 * Contoh penggunaan:
 *   SendUserNotification::dispatch(
 *       userId: $user->id,
 *       type:    'payment',
 *       title:   'Top Up Saldo Berhasil',
 *       message: 'Saldo Anda bertambah Rp 100.000',
 *       link:    '/dashboard/wallet',
 *       data:    ['amount' => 100000],
 *   );
 */
class SendUserNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly string $type,
        public readonly string $title,
        public readonly string $message,
        public readonly ?string $link = null,
        public readonly array $data = [],
    ) {
    }

    public function handle(): void
    {
        try {
            app(NotificationService::class)->sendToUser(
                userId: $this->userId,
                type: $this->type,
                title: $this->title,
                message: $this->message,
                link: $this->link,
                data: $this->data,
            );
        } catch (\Throwable $e) {
            Log::error('[SendUserNotification] Gagal membuat notifikasi user', [
                'user_id' => $this->userId,
                'title'   => $this->title,
                'error'   => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[SendUserNotification] Job gagal permanen', [
            'user_id' => $this->userId,
            'title'   => $this->title,
            'error'   => $exception->getMessage(),
        ]);
    }
}
