<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function sendToUser(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        array $data = [],
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data ?: null,
            'is_read' => false,
        ]);
    }

    public function sendToAdmins(
        string $type,
        string $title,
        string $message,
        string $link = '/admin',
        array $data = [],
    ): void {
        User::where('role', 'admin')
            ->select('id')
            ->chunkById(100, function ($admins) use ($type, $title, $message, $link, $data) {
                foreach ($admins as $admin) {
                    $this->sendToUser(
                        userId: $admin->id,
                        type: $type,
                        title: $title,
                        message: $message,
                        link: $link,
                        data: $data,
                    );
                }
            });
    }
}
