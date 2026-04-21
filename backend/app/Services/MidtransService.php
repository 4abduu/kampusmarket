<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isSandbox;
    protected string $baseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', ''));
        $this->clientKey = config('services.midtrans.client_key', env('MIDTRANS_CLIENT_KEY', ''));
        $this->isSandbox = config('services.midtrans.is_sandbox', env('MIDTRANS_IS_SANDBOX', true));
        $this->baseUrl = $this->isSandbox ? 'https://api.sandbox.midtrans.com' : 'https://api.midtrans.com';
    }

    /**
     * Create Snap token for frontend.
     * Returns array with raw response from Midtrans.
     */
    public function createSnap(array $payload): array
    {
        $url = $this->baseUrl . '/v2/charge';

        // Using Basic Auth with server key as username
        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->post($url, $payload);

        return $response->successful() ? $response->json() : [
            'error' => true,
            'status' => $response->status(),
            'body' => $response->body(),
        ];
    }

    /**
     * Create Snap transaction (legacy Snap exposed via /snap/v1/transactions requires different endpoint and payload).
     * Some integration may prefer /snap/v1/transactions to obtain a token.
     */
    public function createSnapToken(array $payload): array
    {
        $url = $this->isSandbox ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' : 'https://app.midtrans.com/snap/v1/transactions';

        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->post($url, $payload);

        return $response->successful() ? $response->json() : [
            'error' => true,
            'status' => $response->status(),
            'body' => $response->body(),
        ];
    }

    /**
     * Verify signature_key from Midtrans notification.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $computed = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);
        return hash_equals($computed, $signatureKey);
    }
}
