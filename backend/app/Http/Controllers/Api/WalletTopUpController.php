<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletTopUpController extends Controller
{
    protected MidtransService $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * Create Snap token for wallet top-up.
     * Expects: amount in body (in IDR).
     */
    public function createSnap(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:10000|max:50000000', // Min 10k, Max 50M IDR
        ]);

        $user = $request->user();
        $amount = $request->input('amount');

        // Create a payment record in pending state
        $payment = Payment::create([
            'uuid' => Str::uuid(),
            'user_id' => $user->id,
            'order_id' => null,
            'payment_gateway' => 'midtrans',
            'payment_method' => null,
            'transaction_id' => null,
            'gross_amount' => $amount,
            'currency' => 'IDR',
            'type' => 'wallet_topup',
            'status' => 'pending',
        ]);

        $payload = [
            'transaction_details' => [
                'order_id' => $payment->uuid,
                'gross_amount' => (int) $amount,
            ],
            'item_details' => [
                [
                    'id' => 'wallet_topup',
                    'price' => (int) $amount,
                    'quantity' => 1,
                    'name' => 'Top Up Saldo Wallet',
                ],
            ],
            'customer_details' => [
                'first_name' => $user->name ?? 'User',
                'email' => $user->email ?? null,
            ],
        ];

        // Use createSnapToken to obtain token for frontend Snap JS
        $result = $this->midtrans->createSnapToken($payload);

        // Store raw response
        if (isset($result['token'])) {
            $payment->transaction_id = $result['transaction_id'] ?? null;
            $payment->raw_response = $result;
            $payment->save();
            return response()->json([
                'success' => true,
                'snap_token' => $result['token'],
                'payment_uuid' => $payment->uuid,
            ]);
        }

        return response()->json(['success' => false, 'error' => $result], 500);
    }

    /**
     * Webhook endpoint for Midtrans notifications (wallet top-up).
     * Updates payment record AND user wallet balance after successful payment.
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

        // Only process wallet top-up type payments
        if ($payment->type !== 'wallet_topup') {
            return response()->json(['message' => 'invalid payment type'], 400);
        }

        $payment->raw_response = $payload;
        $payment->transaction_id = $payload['transaction_id'] ?? $payment->transaction_id;

        $txStatus = $payload['transaction_status'] ?? '';

        if (in_array($txStatus, ['capture', 'settlement']) || $statusCode === '200') {
            $payment->status = 'paid';
            $payment->paid_at = now();

            $user = $payment->user;
            if ($user && $payment->status === 'paid') {
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance += $payment->gross_amount;
                $user->save();

                // Create wallet transaction record
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'top_up',
                    'amount' => $payment->gross_amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Top up via Midtrans',
                    'status' => 'completed',
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
     * Verifies payment status with Midtrans API and updates wallet balance.
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

        // Only process wallet top-up type payments
        if ($payment->type !== 'wallet_topup') {
            return response()->json(['success' => false, 'message' => 'Invalid payment type'], 400);
        }

        // Already processed
        if ($payment->status === 'paid') {
            return response()->json([
                'success' => true,
                'message' => 'Payment already confirmed',
                'status' => 'paid',
                'balance' => (int) $payment->user->wallet_balance,
            ]);
        }

        // Query Midtrans API for actual transaction status
        $txStatus = $this->midtrans->getTransactionStatus($paymentUuid);

        if (isset($txStatus['error'])) {
            \Illuminate\Support\Facades\Log::warning('[WalletTopUpController] Midtrans status check failed', [
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
                return response()->json([
                    'success' => false,
                    'message' => 'Payment flagged as fraud',
                    'status' => 'failed',
                ]);
            }

            $payment->status = 'paid';
            $payment->paid_at = now();
            $payment->save();

            // Update user wallet balance
            $user = $payment->user;
            if ($user) {
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance += $payment->gross_amount;
                $user->save();

                // Create wallet transaction record
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'top_up',
                    'amount' => $payment->gross_amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Top up via Midtrans (verified via API)',
                    'status' => 'completed',
                ]);

                \App\Models\Notification::create([
                    'user_id' => $user->id,
                    'type' => 'payment',
                    'title' => 'Top Up Saldo Berhasil',
                    'message' => "Top up saldo Rp " . number_format($payment->gross_amount, 0, ',', '.') . " berhasil. Saldo Anda sekarang Rp " . number_format($user->wallet_balance, 0, ',', '.'),
                    'link' => '/dashboard/wallet',
                    'data' => [
                        'type' => 'wallet_topup',
                        'amount' => $payment->gross_amount,
                        'balance' => $user->wallet_balance,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed',
                'status' => 'paid',
                'balance' => (int) $user->wallet_balance,
            ]);
        } elseif ($transactionStatus === 'pending') {
            $payment->save();
            return response()->json([
                'success' => true,
                'message' => 'Payment is pending',
                'status' => 'pending',
            ]);
        } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
            $payment->status = 'failed';
            $payment->save();
            return response()->json([
                'success' => false,
                'message' => 'Payment ' . $transactionStatus,
                'status' => 'failed',
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Unknown transaction status'], 500);
    }
}
