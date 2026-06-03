<?php

namespace App\Jobs;

use App\Models\CodInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use App\Enums\NotificationType;

class DebtReminderJob implements ShouldQueue
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

        Notification::create([
            'user_id' => $invoice->user_id,
            'type' => NotificationType::SYSTEM->value,
            'title' => 'Peringatan Jatuh Tempo Komisi',
            'message' => "Anda memiliki tunggakan komisi Rp " . number_format($invoice->amount, 0, ',', '.') . " yang akan jatuh tempo dalam 2 hari.",
            'link' => '/dashboard/wallet',
            'data' => ['action' => 'pay_debt'],
        ]);
    }
}
