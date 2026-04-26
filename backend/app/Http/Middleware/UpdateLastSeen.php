<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: UpdateLastSeen [BARU]
 *
 * Setiap kali user yang sudah login melakukan request (navigasi, klik, dll),
 * kolom last_seen di tabel users akan diupdate.
 * Ini menjadi dasar penentuan status Online/Offline user.
 */
class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            // Update setiap 60 detik saja agar tidak membebani DB
            $user = $request->user();
            $lastSeen = $user->last_seen;

            if (!$lastSeen || $lastSeen->diffInSeconds(now()) > 60) {
                $user->updateQuietly(['last_seen' => now()]);
            }
        }

        return $next($request);
    }
}
