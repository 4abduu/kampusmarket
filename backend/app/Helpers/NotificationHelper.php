<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Enums\NotificationType;
use App\Enums\CancelReason;
use App\Jobs\SendAdminNotification;
use App\Jobs\SendUserNotification;

/**
 * Centralized Notification Helper
 *
 * Mengurus semua notification creation dengan format konsisten dan tipe button yang tepat.
 */
class NotificationHelper
{
    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Format alasan pembatalan dari enum value (misal "changed_mind")
     * menjadi label yang rapi (misal "Berubah pikiran").
     * Jika nilai tidak dikenali sebagai enum, kembalikan string aslinya.
     */
    public static function formatCancelReason(string|CancelReason $reason): string
    {
        if ($reason instanceof CancelReason) {
            return $reason->label();
        }

        try {
            return CancelReason::from($reason)->label();
        } catch (\ValueError) {
            // Bukan nilai enum yang dikenal — kembalikan apa adanya
            return $reason;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * Pesanan Baru - untuk Seller
     */
    public static function orderNew(int $userId, $order): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Pesanan Baru',
            message: "Anda menerima pesanan baru untuk '{$order->product_title}'. Total: Rp " . number_format($order->total_price, 0, ',', '.'),
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'view_order'],
        );
    }

    /**
     * Pesanan Dikonfirmasi - untuk Buyer
     */
    public static function orderConfirmed(int $userId, $order): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Pesanan Dikonfirmasi',
            message: "Penjual telah mengkonfirmasi pesanan Anda untuk '{$order->product_title}'.",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'view_order'],
        );
    }

    /**
     * Ongkos Kirim Ditetapkan - untuk Buyer
     */
    public static function shippingFeeSet(int $userId, $order, $fee): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Ongkos Kirim Ditetapkan',
            message: "Penjual telah menetapkan ongkos kirim: Rp " . number_format($fee, 0, ',', '.') . ". Silakan lanjut ke pembayaran.",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'proceed_payment'],
        );
    }

    /**
     * Penawaran Harga - untuk Buyer
     */
    public static function priceOffer(int $userId, $order, $price): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Penawaran Harga Baru',
            message: "Penjual memberikan penawaran harga: Rp " . number_format($price, 0, ',', '.') . ". Terima atau tolak?",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'decide_price_offer'],
        );
    }

    /**
     * Penawaran Diterima - untuk Seller
     */
    public static function priceOfferAccepted(int $userId, $order, $price): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Penawaran Diterima',
            message: "Pembeli menyetujui penawaran harga Anda: Rp " . number_format($price, 0, ',', '.'),
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'continue_order'],
        );
    }

    /**
     * Penawaran Ditolak - untuk Seller
     */
    public static function priceOfferRejected(int $userId, $order): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Penawaran Ditolak',
            message: "Pembeli menolak penawaran harga Anda. Silakan berikan penawaran baru.",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'make_new_offer'],
        );
    }

    /**
     * Pembayaran Berhasil - untuk Seller
     */
    public static function paymentReceived(int $userId, $order): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::PAYMENT->value,
            title: 'Pembayaran Berhasil',
            message: "Pembayaran untuk pesanan '{$order->product_title}' diterima. Total: Rp " . number_format($order->total_price, 0, ',', '.'),
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'view_order'],
        );
    }

    /**
     * Pesanan Dikirim/Layanan Selesai - untuk Buyer
     */
    public static function orderShipped(int $userId, $order, bool $isService = false): void
    {
        $title = $isService ? 'Layanan Selesai' : 'Pesanan Dikirim';
        $message = $isService
            ? "Penyedia jasa telah menyelesaikan layanan. Silakan konfirmasi penerimaan jika sudah sesuai."
            : "Pesanan Anda telah dikirim. Silakan lacak pengiriman dan konfirmasi penerimaan.";

        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: $title,
            message: $message,
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'track_and_confirm'],
        );
    }

    /**
     * Pesanan Selesai - untuk Seller
     */
    public static function orderCompleted(int $userId, $order): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::ORDER->value,
            title: 'Pesanan Selesai',
            message: "Pembeli telah mengkonfirmasi penerimaan pesanan '{$order->product_title}'. Dana telah diteruskan ke saldo Anda.",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'view_order'],
        );
    }

    /**
     * Pesanan Dibatalkan - untuk kedua pihak
     */
    public static function orderCancelled(int $userId, $order, string $cancelReason, string $cancelledBy): void
    {
        $formattedReason = self::formatCancelReason($cancelReason);

        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::SYSTEM->value,
            title: 'Pesanan Dibatalkan',
            message: "$cancelledBy membatalkan pesanan '{$order->product_title}'. Alasan: $formattedReason",
            link: "/order-detail/{$order->uuid}",
            data: ['order_id' => $order->uuid, 'action' => 'view_cancellation_details'],
        );
    }

    // ─────────────────────────────────────────────────────────────
    // PAYMENT NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * Top-up Berhasil - untuk User
     */
    public static function topupSuccess(int $userId, $amount): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => NotificationType::PAYMENT->value,
            'title' => 'Top-up Berhasil',
            'message' => "Saldo Anda bertambah: Rp " . number_format($amount, 0, ',', '.'),
            'link' => '/dashboard/wallet',
            'data' => ['action' => 'view_wallet', 'amount' => $amount],
        ]);
    }

    /**
     * Penarikan Saldo Pending - untuk User
     */
    public static function withdrawalPending(int $userId, $withdrawal): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::WITHDRAWAL->value,
            title: 'Penarikan Diproses',
            message: "Permintaan penarikan Anda sebesar Rp " . number_format($withdrawal->amount, 0, ',', '.') . " sedang diproses.",
            link: "/dashboard/wallet",
            data: ['withdrawal_id' => $withdrawal->uuid, 'action' => 'view_withdrawal_status'],
        );
    }

    /**
     * Penarikan Saldo Berhasil - untuk User
     */
    public static function withdrawalSuccess(int $userId, $withdrawal): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::WITHDRAWAL->value,
            title: 'Penarikan Berhasil',
            message: "Penarikan sebesar Rp " . number_format($withdrawal->amount, 0, ',', '.') . " telah masuk ke rekening Anda.",
            link: "/dashboard/wallet",
            data: ['withdrawal_id' => $withdrawal->uuid, 'action' => 'view_history'],
        );
    }

    /**
     * Penarikan Saldo Ditolak - untuk User
     */
    public static function withdrawalFailed(int $userId, $withdrawal, $reason = null): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::SYSTEM->value,
            title: 'Penarikan Gagal',
            message: "Penarikan Anda ditolak. " . ($reason ? "Alasan: $reason" : "Silakan periksa kembali data rekening Anda."),
            link: "/dashboard/wallet",
            data: ['withdrawal_id' => $withdrawal->uuid, 'action' => 'retry_withdrawal'],
        );
    }

    // ─────────────────────────────────────────────────────────────
    // REVIEW/RATING NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * Review Diterima - untuk Seller/User yang di-review
     */
    public static function reviewReceived(int $userId, $review): void
    {
        $review->loadMissing(['reviewer', 'reviewee', 'order.product']);
        $rating = $review->rating ?? 0;
        $reviewerName = $review->reviewer->name ?? 'Pembeli';
        $productUuid = $review->order->product->uuid ?? '';
        $sellerUuid = $review->reviewee->uuid ?? '';

        $shortComment = \Illuminate\Support\Str::limit($review->comment ?? '', 50);

        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::REVIEW->value,
            title: "Review Baru ({$rating}/5)",
            message: "Anda menerima review baru: \"{$shortComment}\" - dari {$reviewerName}",
            link: "/product/{$productUuid}#reviews",
            data: ['review_id' => $review->uuid, 'seller_uuid' => $sellerUuid, 'action' => 'view_review'],
        );
    }

    /**
     * Balasan Review - untuk Reviewer
     */
    public static function reviewReplyReceived(int $userId, $review): void
    {
        $review->loadMissing(['reviewee', 'order.product']);
        $productUuid = $review->order->product->uuid ?? '';
        $sellerUuid = $review->reviewee->uuid ?? '';

        $shortResponse = \Illuminate\Support\Str::limit($review->seller_response ?? '', 50);

        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::REVIEW->value,
            title: 'Ada Balasan untuk Review Anda',
            message: "Penjual merespons review Anda: \"{$shortResponse}\"",
            link: "/product/{$productUuid}#reviews",
            data: ['review_id' => $review->uuid, 'seller_uuid' => $sellerUuid, 'action' => 'view_reply'],
        );
    }

    // ─────────────────────────────────────────────────────────────
    // CHAT NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    public static function chatPriceOffer(int $userId, $chat, $offerPrice, $sender): void
    {
        $existingNotification = Notification::where('user_id', $userId)
            ->where('type', NotificationType::CHAT->value)
            ->where('is_read', false)
            ->where('data->chat_id', $chat->uuid)
            ->first();

        if ($existingNotification) {
            $existingNotification->update([
                'title' => "Penawaran Harga dari {$sender->name}",
                'message' => "Ada penawaran harga baru yang belum Anda baca. Cek sekarang!",
                'updated_at' => now(),
            ]);

            try {
                broadcast(new \App\Events\NewNotification($existingNotification));
            } catch (\Throwable $e) {
                // Abaikan error broadcast
            }
        } else {
            SendUserNotification::dispatchSync(
                userId: $userId,
                type: NotificationType::CHAT->value,
                title: "Penawaran Harga dari {$sender->name}",
                message: "Rp " . number_format($offerPrice, 0, ',', '.') . " untuk '{$chat->product->title}'",
                link: "/chat",
                data: ['chat_id' => $chat->uuid, 'offer_price' => $offerPrice, 'action' => 'view_offer'],
            );
        }
    }

    /**
     * Pesan Chat Baru - untuk recipient
     * Strategi Anti-Spam: Update notifikasi yang belum dibaca dari chat room yang sama,
     * jika belum ada maka buat notifikasi baru.
     */
    public static function chatMessageReceived(int $userId, $chat, $message, $sender): void
    {
        $existingNotification = Notification::where('user_id', $userId)
            ->where('type', NotificationType::CHAT->value)
            ->where('is_read', false)
            ->where('data->chat_id', $chat->uuid)
            ->first();

        if ($existingNotification) {
            $existingNotification->update([
                'title' => "Pesan baru dari {$sender->name}",
                'message' => "Ada pesan baru yang belum Anda baca. Cek sekarang!",
                'updated_at' => now(),
            ]);

            try {
                broadcast(new \App\Events\NewNotification($existingNotification));
            } catch (\Throwable $e) {
                // Abaikan error broadcast
            }
        } else {
            SendUserNotification::dispatchSync(
                userId: $userId,
                type: NotificationType::CHAT->value,
                title: "Pesan baru dari {$sender->name}",
                message: "Ada pesan baru masuk. Cek sekarang!",
                link: "/chat",
                data: ['chat_id' => $chat->uuid, 'action' => 'view_chat'],
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * Permintaan Pembatalan Baru - untuk Admin
     */
    public static function adminCancelRequest($cancelRequest): void
    {
        $cancelRequest->loadMissing('order');
        $formattedReason = self::formatCancelReason($cancelRequest->reason);

        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Permintaan Pembatalan',
            message: "Pembeli meminta pembatalan untuk pesanan '{$cancelRequest->order->product_title}'. Alasan: {$formattedReason}",
            link: "/admin/cancel-requests",
            data: [
                'cancel_request_id' => $cancelRequest->uuid,
                'order_id' => $cancelRequest->order->uuid,
                'action' => 'review_cancellation',
                'action_tab' => 'cancel-requests',
            ],
        );
    }

    /**
     * Laporan Produk Baru - untuk Admin
     */
    public static function adminProductReport($report): void
    {
        $report->loadMissing('product');
        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Laporan Produk Baru',
            message: "Ada laporan produk \"{$report->product->title}\" - Alasan: {$report->reason}",
            link: "/admin/reports",
            data: [
                'report_id' => $report->uuid,
                'product_id' => $report->product->uuid,
                'action' => 'view_report_and_product',
                'action_tab' => 'reports',
            ],
        );
    }

    /**
     * Laporan User Baru - untuk Admin
     */
    public static function adminUserReport($report): void
    {
        $report->loadMissing('reportedUser');
        $reportedUserName = $report->reportedUser->name ?? 'User';
        $reportedUserUuid = $report->reportedUser->uuid ?? '';

        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Laporan User Baru',
            message: "Ada laporan user \"{$reportedUserName}\" - Alasan: {$report->reason}",
            link: "/admin/reports",
            data: [
                'report_id' => $report->uuid,
                'reported_user_id' => $reportedUserUuid,
                'action' => 'view_report_and_user',
                'action_tab' => 'reports',
            ],
        );
    }

    /**
     * Penarikan Saldo User - untuk Admin
     */
    public static function adminWithdrawalRequest($withdrawal): void
    {
        $withdrawal->loadMissing('user');
        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Permintaan Penarikan Baru',
            message: "{$withdrawal->user->name} meminta penarikan Rp " . number_format($withdrawal->amount, 0, ',', '.'),
            link: "/admin/finance",
            data: [
                'withdrawal_id' => $withdrawal->uuid,
                'user_id' => $withdrawal->user->uuid,
                'action' => 'process_withdrawal',
                'action_tab' => 'finance',
            ],
        );
    }

    /**
     * Produk Verifikasi - untuk Admin
     */
    public static function adminProductVerification($product): void
    {
        $product->loadMissing('seller');
        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Produk Menunggu Verifikasi',
            message: "Produk baru \"{$product->title}\" dari {$product->seller->name} menunggu verifikasi.",
            link: "/admin/products",
            data: [
                'product_id' => $product->uuid,
                'seller_id' => $product->seller->uuid,
                'action' => 'verify_product',
                'action_tab' => 'products',
            ],
        );
    }

    /**
     * Produk Dihapus Admin - untuk Seller
     */
    public static function adminProductDeleted(int $userId, $product, string $reason): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::SYSTEM->value,
            title: 'Produk Dihapus oleh Admin',
            message: "Produk Anda \"{$product->title}\" telah dihapus oleh Admin. Alasan: {$reason}",
            link: "/dashboard/products",
            data: ['product_id' => $product->uuid, 'action' => 'view_my_products'],
        );
    }

    /**
     * Produk Dipulihkan Admin - untuk Seller
     */
    public static function adminProductRestored(int $userId, $product): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::SYSTEM->value,
            title: 'Produk Dipulihkan oleh Admin',
            message: "Produk Anda \"{$product->title}\" telah dipulihkan oleh Admin dan kembali aktif.",
            link: "/dashboard/products",
            data: ['product_id' => $product->uuid, 'action' => 'view_my_products'],
        );
    }

    /**
     * Peringatan Akun - untuk User
     */
    public static function adminUserWarning(int $userId, string $reason): void
    {
        SendUserNotification::dispatch(
            userId: $userId,
            type: NotificationType::SYSTEM->value,
            title: 'Peringatan Akun',
            message: "Akun Anda mendapat peringatan dari Admin. Alasan: {$reason}",
            link: "/dashboard/settings",
            data: ['action' => 'view_account_settings'],
        );
    }

    /**
     * Registrasi User Baru - untuk Admin
     */
    public static function adminNewUser($user): void
    {
        SendAdminNotification::dispatch(
            type: NotificationType::SYSTEM->value,
            title: 'Pengguna Baru Terdaftar',
            message: "Pengguna baru \"{$user->name}\" telah mendaftar. Email: {$user->email}",
            link: "/admin/users",
            data: [
                'user_id' => $user->uuid,
                'action' => 'view_user_details',
                'action_tab' => 'users',
            ],
        );
    }

    /**
     * Top-up Berhasil - untuk Admin
     */
    public static function adminTopupSuccess($user, $amount): void
    {
        SendAdminNotification::dispatch(
            type: NotificationType::PAYMENT->value,
            title: 'Top-up Berhasil',
            message: "Pengguna \"{$user->name}\" berhasil melakukan top-up Rp " . number_format($amount, 0, ',', '.'),
            link: "/admin/finance",
            data: [
                'user_id' => $user->uuid,
                'action' => 'view_finance',
                'action_tab' => 'finance',
            ],
        );
    }
}
