<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case TOP_UP = 'top_up';
    case WITHDRAWAL = 'withdrawal';
    case PAYMENT = 'payment';
    case REFUND = 'refund';
    case INCOME = 'income';
    case ADMIN_FEE = 'admin_fee';

    public function label(): string
    {
        return match ($this) {
            self::TOP_UP => 'Top Up',
            self::WITHDRAWAL => 'Penarikan',
            self::PAYMENT => 'Pembayaran',
            self::REFUND => 'Refund',
            self::INCOME => 'Pendapatan',
            self::ADMIN_FEE => 'Biaya Admin',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::TOP_UP => '↓',
            self::WITHDRAWAL => '↑',
            self::PAYMENT => '↑',
            self::REFUND => '↩',
            self::INCOME => '↓',
            self::ADMIN_FEE => '−',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::TOP_UP => 'emerald',
            self::WITHDRAWAL => 'red',
            self::PAYMENT => 'red',
            self::REFUND => 'emerald',
            self::INCOME => 'emerald',
            self::ADMIN_FEE => 'amber',
        };
    }

    public function isIncome(): bool
    {
        return in_array($this, [self::TOP_UP, self::REFUND, self::INCOME]);
    }
}
