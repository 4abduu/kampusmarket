<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MidtransService;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected MidtransService $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * Create Snap token for an order.
     * Expects: order_id in body.
     */
    public function createSnap(Request $request)
    {
        $request->validate(['order_id' => 'required|integer']);

        $order = Order::findOrFail($request->input('order_id'));

        // Create a payments record in pending state
        $payment = Payment::create([
            'uuid' => Str::uuid(),
            'order_id' => $order->id,
            'payment_gateway' => 'midtrans',
            'payment_method' => null,
            'transaction_id' => null,
            'gross_amount' => $order->total_price ?? 0,
            'currency' => 'IDR',
            'status' => 'pending',
        ]);

        $payload = [
            'transaction_details' => [
                'order_id' => $payment->uuid,
                'gross_amount' => (int) ($payment->gross_amount / 100),
            ],
            'item_details' => [
                [
                    'id' => $order->product_id,
                    'price' => (int) ($order->final_price / 100),
                    'quantity' => $order->quantity,
                    'name' => $order->product_title,
                ],
            ],
            'customer_details' => [
                'first_name' => $order->buyer?->name ?? 'Buyer',
                'email' => $order->buyer?->email ?? null,
            ],
        ];

        // Use createSnapToken to obtain token for frontend Snap JS
        $result = $this->midtrans->createSnapToken($payload);

        // store raw response
        $payment->raw_response = $result;
        if (isset($result['token'])) {
            $payment->transaction_id = $result['transaction_id'] ?? null;
            $payment->save();
            return response()->json(['success' => true, 'snap_token' => $result['token']]);
        }

        return response()->json(['success' => false, 'error' => $result], 500);
    }

    /**
     * Webhook endpoint for Midtrans notifications.
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? $payload['status_code'] ?? null;
        $signatureKey = $payload['signature_key'] ?? $request->header('x-notif-signature');
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? ($payload['gross_amount'] ?? '0');

        if (!$orderId) {
            return response()->json(['message' => 'missing order_id'], 400);
        }

        $verified = $this->midtrans->verifySignature($orderId, (string) $statusCode, (string) $grossAmount, (string) $signatureKey);

        if (!$verified) {
            return response()->json(['message' => 'invalid signature'], 403);
        }

        // Find payment by uuid (we used payment.uuid as order_id sent to midtrans)
        $payment = Payment::where('uuid', $orderId)->first();

        if (!$payment) {
            return response()->json(['message' => 'payment not found'], 404);
        }

        // Update payment record
        $payment->raw_response = $payload;
        $payment->transaction_id = $payload['transaction_id'] ?? $payment->transaction_id;

        if (($payload['transaction_status'] ?? '') === 'capture' || ($payload['transaction_status'] ?? '') === 'settlement' || ($payload['status_code'] ?? '') === '200') {
            $payment->status = 'paid';
            $payment->paid_at = now();
            // also update order payment_status
            $order = $payment->order;
            if ($order) {
                $order->payment_status = 'paid';
                $order->paid_at = now();
                $order->save();
            }
        } elseif (($payload['transaction_status'] ?? '') === 'deny' || ($payload['transaction_status'] ?? '') === 'cancel' || ($payload['transaction_status'] ?? '') === 'expire') {
            $payment->status = 'failed';
        }

        $payment->save();

        return response()->json(['message' => 'ok']);
    }
}
