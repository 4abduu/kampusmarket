<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Notification
 * Dengan button action yang sesuai konteks
 */
class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Format tanggal relative (2 jam yang lalu, Kemarin, etc)
        $relativeTime = $this->getRelativeTime($this->created_at);
        
        // Determine action button from data.action field
        $action = $this->data['action'] ?? null;
        $actionButton = $this->getActionButton($action, $this->type->value);

        return [
            'id' => $this->uuid,
            'userId' => $this->user->uuid,
            'type' => $this->type->value ?? $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'link' => $this->link,
            'data' => $this->data,
            'isRead' => $this->is_read,
            'readAt' => $this->read_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
            'createdAtRelative' => $relativeTime, // Human readable: "2 jam yang lalu"
            'action' => $actionButton, // Button info
        ];
    }

    /**
     * Format tanggal ke format relative (e.g., "2 jam yang lalu", "Kemarin")
     */
    private function getRelativeTime($date): string
    {
        $now = now();
        $diffMs = $now->diffInMilliseconds($date);
        $diffMins = $now->diffInMinutes($date);
        $diffHours = $now->diffInHours($date);
        $diffDays = $now->diffInDays($date);

        if ($diffMins < 1) return 'Baru saja';
        if ($diffMins < 60) return "{$diffMins} menit yang lalu";
        if ($diffHours < 24) return "{$diffHours} jam yang lalu";
        if ($diffDays === 1) return 'Kemarin';
        if ($diffDays < 7) return "{$diffDays} hari yang lalu";
        if ($diffDays < 30) return 'Minggu lalu';
        return 'Bulan lalu';
    }

    /**
     * Get action button berdasarkan action type
     * Return format: ['label' => 'Lihat Pesanan', 'icon' => 'eye', 'color' => 'primary']
     */
    private function getActionButton(?string $action, string $type): ?array
    {
        $buttons = [
            // ORDER actions
            'view_order' => ['label' => 'Lihat Pesanan', 'icon' => 'shopping-bag', 'color' => 'primary'],
            'proceed_payment' => ['label' => 'Lanjut Pembayaran', 'icon' => 'credit-card', 'color' => 'primary'],
            'decide_price_offer' => ['label' => 'Buat Keputusan', 'icon' => 'zap', 'color' => 'primary'],
            'continue_order' => ['label' => 'Lanjutkan Pesanan', 'icon' => 'arrow-right', 'color' => 'primary'],
            'make_new_offer' => ['label' => 'Penawaran Baru', 'icon' => 'edit', 'color' => 'primary'],
            'process_order' => ['label' => 'Proses Pesanan', 'icon' => 'list-checks', 'color' => 'primary'],
            'track_and_confirm' => ['label' => 'Lacak & Konfirmasi', 'icon' => 'truck', 'color' => 'primary'],
            'view_cancellation_details' => ['label' => 'Lihat Detail', 'icon' => 'info', 'color' => 'secondary'],
            
            // PAYMENT actions
            'view_wallet' => ['label' => 'Lihat Saldo', 'icon' => 'wallet', 'color' => 'primary'],
            'info_only' => null, // No button for info-only
            'view_withdrawal_status' => ['label' => 'Lihat Status', 'icon' => 'clock', 'color' => 'info'],
            'view_history' => ['label' => 'Lihat Histori', 'icon' => 'history', 'color' => 'primary'],
            'retry_withdrawal' => ['label' => 'Coba Lagi', 'icon' => 'redo', 'color' => 'warning'],
            
            // REVIEW actions
            'view_review' => ['label' => 'Lihat Review', 'icon' => 'star', 'color' => 'primary'],
            'view_reply' => ['label' => 'Lihat Balasan', 'icon' => 'message-circle', 'color' => 'primary'],
            
            // CHAT actions
            'open_chat' => ['label' => 'Buka Chat', 'icon' => 'message-circle', 'color' => 'primary'],
            'view_offer' => ['label' => 'Lihat Penawaran', 'icon' => 'eye', 'color' => 'primary'],
            
            // ADMIN actions
            'review_cancellation' => ['label' => 'Tinjau', 'icon' => 'clipboard-list', 'color' => 'warning'],
            'view_report_and_product' => ['label' => 'Lihat Laporan', 'icon' => 'alert-circle', 'color' => 'danger'],
            'view_report_and_user' => ['label' => 'Lihat Laporan', 'icon' => 'alert-circle', 'color' => 'danger'],
            'process_withdrawal' => ['label' => 'Proses', 'icon' => 'check', 'color' => 'primary'],
            'verify_product' => ['label' => 'Verifikasi', 'icon' => 'check-circle', 'color' => 'primary'],
            'view_details' => ['label' => 'Lihat Detail', 'icon' => 'eye', 'color' => 'primary'],
        ];

        return $buttons[$action] ?? null;
    }
}
