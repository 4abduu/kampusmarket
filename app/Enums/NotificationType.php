<?php

namespace App\Enums;

enum NotificationType: string
{
    case ORDER = 'order';
    case CHAT = 'chat';
    case PAYMENT = 'payment';
    case SYSTEM = 'system';
    case WITHDRAWAL = 'withdrawal';
    case REVIEW = 'review';

    public function label(): string
    {
        return match ($this) {
            self::ORDER => 'Pesanan',
            self::CHAT => 'Pesan',
            self::PAYMENT => 'Pembayaran',
            self::SYSTEM => 'Sistem',
            self::WITHDRAWAL => 'Penarikan',
            self::REVIEW => 'Ulasan',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::ORDER => 'shopping-bag',
            self::CHAT => 'message-circle',
            self::PAYMENT => 'credit-card',
            self::SYSTEM => 'bell',
            self::WITHDRAWAL => 'wallet',
            self::REVIEW => 'star',
        };
    }
}
