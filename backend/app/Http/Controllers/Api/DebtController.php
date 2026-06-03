<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\CodInvoice;
use App\Models\WalletTransaction;
use App\Models\Payment;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DebtController extends Controller
{
    use ApiResponse;

    /**
     * Get debt summary for the authenticated user.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $invoices = CodInvoice::with('order.product')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $unpaidInvoices = $invoices->where('status', 'unpaid');
        $totalDebt = $unpaidInvoices->sum('amount');
        $hasOverdue = $unpaidInvoices->contains(function ($invoice) {
            return now()->greaterThanOrEqualTo($invoice->due_date);
        });

        // Pastikan sinkronisasi state
        if ($user->has_overdue_debt && !$hasOverdue) {
            $user->update(['has_overdue_debt' => false]);
        } elseif (!$user->has_overdue_debt && $hasOverdue) {
            $user->update(['has_overdue_debt' => true]);
        }

        return $this->success([
            'total_debt' => $totalDebt,
            'has_overdue' => $hasOverdue,
            'is_restricted' => $user->has_overdue_debt,
            'invoices' => $invoices,
        ], 'Debt summary retrieved');
    }

    /**
     * Pay all unpaid debts using Wallet Balance.
     */
    public function payWallet(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_pin' => 'required|string',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $user = User::where('id', $request->user()->id)->lockForUpdate()->firstOrFail();

                if (!$user->wallet_pin) {
                    throw new \Exception('PIN Wallet belum diatur', 400);
                }
                if (!\Illuminate\Support\Facades\Hash::check($request->wallet_pin, $user->wallet_pin)) {
                    throw new \Exception('PIN Wallet salah', 400);
                }

                $unpaidInvoices = CodInvoice::where('user_id', $user->id)
                    ->where('status', 'unpaid')
                    ->get();

                $totalDebt = $unpaidInvoices->sum('amount');

                if ($totalDebt <= 0) {
                    throw new \Exception('Tidak ada tagihan yang perlu dibayar', 400);
                }

                if ($user->wallet_balance < $totalDebt) {
                    throw new \Exception('Saldo tidak mencukupi untuk melunasi seluruh tagihan', 400);
                }

                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance -= $totalDebt;
                $user->has_overdue_debt = false;
                $user->save();

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'debt_payment',
                    'amount' => -$totalDebt,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'Pelunasan tunggakan komisi via Dompet',
                    'status' => 'completed',
                ]);

                foreach ($unpaidInvoices as $invoice) {
                    $invoice->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }
            });

            return $this->success(null, 'Tunggakan komisi berhasil dilunasi');
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal melunasi tunggakan', null, $code);
        }
    }

    /**
     * Pay all unpaid debts using Midtrans (Minimum Rp 10.000).
     */
    public function payMidtrans(Request $request): JsonResponse
    {
        try {
            return DB::transaction(function () use ($request) {
                $user = $request->user();

                $unpaidInvoices = CodInvoice::with('order.product')
                    ->where('user_id', $user->id)
                    ->where('status', 'unpaid')
                    ->get();

                $totalDebt = $unpaidInvoices->sum('amount');

                if ($totalDebt <= 0) {
                    throw new \Exception('Tidak ada tagihan yang perlu dibayar', 400);
                }

                // VALIDASI MINIMUM MIDTRANS 10.000
                if ($totalDebt < 10000) {
                    throw new \Exception('Total tagihan di bawah Rp 10.000. Silakan gunakan metode pembayaran Dompet Platform.', 400);
                }

                $midtrans = app(MidtransService::class);

                $payment = Payment::create([
                    'uuid' => Str::uuid(),
                    'user_id' => $user->id,
                    'type' => 'debt_payment',
                    'payment_gateway' => 'midtrans',
                    'gross_amount' => $totalDebt,
                    'currency' => 'IDR',
                    'status' => 'pending',
                ]);

                $itemDetails = [];
                foreach ($unpaidInvoices as $invoice) {
                    $itemDetails[] = [
                        'id' => (string) $invoice->uuid,
                        'price' => (int) $invoice->amount,
                        'quantity' => 1,
                        'name' => 'Komisi COD - ' . substr($invoice->order->order_number, 0, 30),
                    ];
                }

                $payload = [
                    'transaction_details' => [
                        'order_id' => (string) $payment->uuid,
                        'gross_amount' => (int) $payment->gross_amount,
                    ],
                    'item_details' => $itemDetails,
                    'customer_details' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                    ],
                ];

                $result = $midtrans->createSnapToken($payload);

                $payment->raw_response = $result;
                if (isset($result['token'])) {
                    $payment->transaction_id = $result['transaction_id'] ?? null;
                    $payment->save();
                    return $this->success([
                        'snap_token' => $result['token'],
                        'payment_uuid' => (string) $payment->uuid,
                    ], 'Token pembayaran berhasil dibuat');
                }

                $payment->save();
                throw new \Exception('Gagal membuat token pembayaran dari Midtrans', 500);
            });
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal memproses pembayaran Midtrans', null, $code);
        }
    }

    /**
     * Simulate Expired Debt for testing purposes.
     */
    public function simulateExpired(Request $request): JsonResponse
    {
        if (!config('app.debug')) {
            return $this->error('Hanya tersedia di mode debug', null, 403);
        }

        $user = $request->user();
        
        $invoices = CodInvoice::where('user_id', $user->id)
            ->where('status', 'unpaid')
            ->update([
                'due_date' => now()->subDays(1)
            ]);

        if ($invoices > 0) {
            $user->update(['has_overdue_debt' => true]);
            return $this->success(null, 'Simulasi berhasil: Tagihan dibuat expired dan akun dibatasi.');
        }

        return $this->error('Tidak ada tagihan unpaid untuk disimulasikan', null, 400);
    }
}
