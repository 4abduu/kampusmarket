<?php

namespace App\Jobs;

use App\Models\CodInvoice;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use App\Enums\NotificationType;

class CheckDebtExpirationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $invoiceUuid;

    public function __construct($invoiceUuid)
    {
        $this->invoiceUuid = $invoiceUuid;
    }

    public function handle(): void
    {
        $invoice = CodInvoice::where('uuid', $this->invoiceUuid)->first();
        if (!$invoice || $invoice->status === 'paid') return;

        // Jika lewat jatuh tempo dan belum dibayar, batasi akses akun
        if (now()->greaterThanOrEqualTo($invoice->due_date)) {
            $user = User::find($invoice->user_id);
            if ($user && !$user->has_overdue_debt) {
                $user->has_overdue_debt = true;
                $user->save();

                Notification::create([
                    'user_id' => $user->id,
                    'type' => NotificationType::SYSTEM->value,
                    'title' => 'Akses Dibatasi - Tunggakan Komisi',
                    'message' => "Akses akun Anda dibatasi sementara karena ada tunggakan komisi yang melewati jatuh tempo. Silakan lakukan pelunasan.",
                    'link' => '/dashboard/wallet',
                    'data' => ['action' => 'pay_debt'],
                ]);
            }
        }
    }
}
