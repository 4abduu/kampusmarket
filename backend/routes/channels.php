<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

/**
 * routes/channels.php [BARU]
 *
 * Definisi otorisasi private channel untuk Laravel Echo + Reverb.
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
