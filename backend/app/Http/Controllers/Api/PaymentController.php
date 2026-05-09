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
                'gross_amount' => (int) $payment->gross_amount,
            ],
            'item_details' => [
                [
                    'id' => $order->product_id,
                    'price' => (int) $order->final_price,
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
     * Updates payment record AND order status after successful payment.
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $signatureKey = $payload['signature_key'] ?? $request->header('x-notif-signature');
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '0';

        if (!$orderId) {
            return response()->json(['message' => 'missing order_id'], 400);
        }

        $verified = $this->midtrans->verifySignature($orderId, (string) $statusCode, (string) $grossAmount, (string) $signatureKey);

        if (!$verified) {
            return response()->json(['message' => 'invalid signature'], 403);
        }

        $payment = Payment::where('uuid', $orderId)->first();

        if (!$payment) {
            return response()->json(['message' => 'payment not found'], 404);
        }

        $payment->raw_response = $payload;
        $payment->transaction_id = $payload['transaction_id'] ?? $payment->transaction_id;

        $txStatus = $payload['transaction_status'] ?? '';

        if (in_array($txStatus, ['capture', 'settlement']) || $statusCode === '200') {
            $payment->status = 'paid';
            $payment->paid_at = now();

            $order = $payment->order;
            if ($order && $order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
                $order->paid_at = now();

                // Update order status based on shipping type (escrow - no seller transfer)
                $shippingType = $order->shipping_type;
                if (is_string($shippingType)) {
                    $shippingType = \App\Enums\ShippingType::tryFrom($shippingType);
                }

                $newStatus = match ($shippingType) {
                    \App\Enums\ShippingType::PICKUP => \App\Enums\OrderStatus::READY_PICKUP,
                    default => \App\Enums\OrderStatus::PROCESSING,
                };

                $order->status = $newStatus;
                $order->save();

                \App\Models\OrderHistory::create([
                    'uuid' => \Illuminate\Support\Str::uuid(),
                    'order_id' => $order->id,
                    'status' => $newStatus->value,
                    'notes' => 'Pembayaran Midtrans berhasil — dana ditahan di escrow',
                    'actor_id' => $order->buyer_id,
                ]);
            }
        } elseif (in_array($txStatus, ['deny', 'cancel', 'expire'])) {
            $payment->status = 'failed';
        }

        $payment->save();

        return response()->json(['message' => 'ok']);
    }

    /**
     * Client-side payment confirmation.
     * Called by frontend after Midtrans Snap returns onSuccess/onPending.
     * Verifies payment status with Midtrans API and updates order.
     * This solves the problem where webhooks can't reach localhost.
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_uuid' => 'required|string',
        ]);

        $paymentUuid = $request->input('payment_uuid');
        $payment = Payment::where('uuid', $paymentUuid)->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
        }

        // Already processed
        if ($payment->status === 'paid') {
            return response()->json(['success' => true, 'message' => 'Payment already confirmed', 'status' => 'paid']);
        }

        // Query Midtrans API for actual transaction status
        $txStatus = $this->midtrans->getTransactionStatus($paymentUuid);

        if (isset($txStatus['error'])) {
            \Illuminate\Support\Facades\Log::warning('[PaymentController] Midtrans status check failed', [
                'payment_uuid' => $paymentUuid,
                'response' => $txStatus,
            ]);
            return response()->json(['success' => false, 'message' => 'Could not verify payment status'], 502);
        }

        $transactionStatus = $txStatus['transaction_status'] ?? '';
        $statusCode = $txStatus['status_code'] ?? '';
        $fraudStatus = $txStatus['fraud_status'] ?? 'accept';

        // Update payment record
        $payment->raw_response = $txStatus;
        $payment->transaction_id = $txStatus['transaction_id'] ?? $payment->transaction_id;
        $payment->payment_method = $txStatus['payment_type'] ?? $payment->payment_method;

        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            // For capture, only accept if fraud_status is accept
            if ($transactionStatus === 'capture' && $fraudStatus !== 'accept') {
                $payment->status = 'failed';
                $payment->save();
                return response()->json(['success' => false, 'message' => 'Payment flagged as fraud', 'status' => 'failed']);
            }

            $payment->status = 'paid';
            $payment->paid_at = now();
            $payment->save();

            // Update order status
            $order = $payment->order;
            if ($order && $order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
                $order->paid_at = now();

                $shippingType = $order->shipping_type;
                if (is_string($shippingType)) {
                    $shippingType = \App\Enums\ShippingType::tryFrom($shippingType);
                }

                $newStatus = match ($shippingType) {
                    \App\Enums\ShippingType::PICKUP => \App\Enums\OrderStatus::READY_PICKUP,
                    default => \App\Enums\OrderStatus::PROCESSING,
                };

                $order->status = $newStatus;
                $order->save();

                \App\Models\OrderHistory::create([
                    'uuid' => Str::uuid(),
                    'order_id' => $order->id,
                    'status' => $newStatus->value,
                    'notes' => 'Pembayaran Midtrans berhasil (verified via API) — dana ditahan di escrow',
                    'actor_id' => $order->buyer_id,
                ]);

                \App\Models\Notification::createOrderNotification(
                    $order->seller_id,
                    'Pembayaran Berhasil',
                    "Pembayaran dari pembeli untuk pesanan '{$order->product_title}' telah berhasil. Silakan proses pesanan.",
                    $order->uuid
                );
            }

            return response()->json(['success' => true, 'message' => 'Payment confirmed', 'status' => 'paid']);
        } elseif ($transactionStatus === 'pending') {
            $payment->save();
            return response()->json(['success' => true, 'message' => 'Payment is pending', 'status' => 'pending']);
        } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
            $payment->status = 'failed';
            $payment->save();
            return response()->json(['success' => false, 'message' => 'Payment ' . $transactionStatus, 'status' => 'failed']);
        }

        $payment->save();
        return response()->json(['success' => true, 'message' => 'Status: ' . $transactionStatus, 'status' => $transactionStatus]);
    }
}
