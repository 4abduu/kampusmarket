/**
 * echo.ts [FIX v2 — fix TS errors + broadcasting/auth 401]
 *
 * Fix 1 (401): Pusher.js membuat request auth langsung dari browser,
 * tidak lewat Vite proxy. Solusi: custom authorizer menggunakan axios
 * yang sudah dikonfigurasi (baseURL backend + withCredentials: true).
 *
 * Fix 2 (TS): `Options` bukan export dari 'laravel-echo', melainkan
 * dari 'pusher-js'. Channel parameter diberi type eksplisit dari pusher-js.
 *
 * Setup .env frontend:
 *   VITE_REVERB_APP_KEY=kampusmarket-key
 *   VITE_REVERB_HOST=localhost
 *   VITE_REVERB_PORT=8080
 *   VITE_REVERB_SCHEME=http
 *   VITE_API_BASE_URL=http://localhost:8000/api
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';
import apiClient from '@/lib/api/client';

(window as typeof window & { Pusher: typeof Pusher }).Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Custom authorizer untuk Pusher.js.
 *
 * Menggantikan mekanisme default yang tidak membawa cookie / token.
 * Menggunakan apiClient (axios) yang sudah dikonfigurasi:
 *   - baseURL: http://localhost:8000/api  → request langsung ke Laravel
 *   - withCredentials: true              → cookie authToken ikut terkirim
 *   - interceptor Authorization header  → Bearer token dari localStorage
 */
function makeAuthorizer(channel: Channel) {
  return {
    authorize(socketId: string, callback: (error: boolean, data: unknown) => void) {
      apiClient
        .post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((data: unknown) => {
          callback(false, data);
        })
        .catch((err: unknown) => {
          callback(true, err);
        });
    },
  };
}

export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;
  if (!key) {
    throw new Error('VITE_REVERB_APP_KEY tidak ada di .env — Reverb tidak dikonfigurasi');
  }

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: (import.meta.env.VITE_REVERB_HOST as string) || window.location.hostname,
    wsPort: parseInt((import.meta.env.VITE_REVERB_PORT as string) || '8080', 10),
    wssPort: parseInt((import.meta.env.VITE_REVERB_PORT as string) || '443', 10),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME as string) === 'https',
    enabledTransports: ['ws', 'wss'],

    // FIX: Hapus authEndpoint (mengarah ke Vite, bukan Laravel).
    // Custom authorizer pakai axios → request ke http://localhost:8000/api/broadcasting/auth
    // dengan credentials yang benar (cookie + Authorization header).
    // @ts-expect-error Callback signature mismatch between Reverb and Pusher.js types
    authorizer: makeAuthorizer,
  });

  return echoInstance;
}

export function destroyEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export default getEcho;
