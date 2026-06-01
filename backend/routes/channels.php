<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

/**
 * routes/channels.php [BARU]
 *
 * Definisi otorisasi private channel untuk Laravel Echo + Pusher.
 * Setiap channel `chat.{uuid}` hanya bisa diakses oleh buyer atau seller chat tersebut.
 */

/**
 * Private channel: chat.{uuid}
 *
 * User diizinkan subscribe hanya jika dia adalah buyer atau seller chat.
 * Frontend subscribe dengan: Echo.private(`chat.${chatUuid}`)
 */
Broadcast::channel('chat.{uuid}', function ($user, string $uuid) {
    $chat = Chat::where('uuid', $uuid)->first();

    if (!$chat) {
        return false;
    }

    return $chat->buyer_id === $user->id || $chat->seller_id === $user->id;
});

/**
 * Private channel per user (pakai UUID user, sesuai payload API frontend).
 */
Broadcast::channel('users.{uuid}', function ($user, string $uuid) {
    return $user->uuid === $uuid;
});

/**
 * Presence channel global untuk status online/offline realtime.
 */
Broadcast::channel('online', function ($user) {
    return [
        'id' => $user->uuid,
        'name' => $user->name,
    ];
});

/**
 * Private channel: order.{uuid}
 *
 * User diizinkan subscribe hanya jika dia adalah buyer atau seller order.
 */
Broadcast::channel('order.{uuid}', function ($user, string $uuid) {
    $order = \App\Models\Order::where('uuid', $uuid)->first();

    if (!$order) {
        return false;
    }

    return $order->buyer_id === $user->id || $order->seller_id === $user->id;
});
