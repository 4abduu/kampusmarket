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
    case COD_FEE_DEDUCTION = 'cod_fee_deduction';
    case DEBT_PAYMENT = 'debt_payment';

    public function label(): string
    {
        return match ($this) {
            self::TOP_UP => 'Top Up',
            self::WITHDRAWAL => 'Penarikan',
            self::PAYMENT => 'Pembayaran',
            self::REFUND => 'Refund',
            self::INCOME => 'Pendapatan',
            self::ADMIN_FEE => 'Biaya Admin',
            self::COD_FEE_DEDUCTION => 'Potongan Komisi',
            self::DEBT_PAYMENT => 'Pelunasan Komisi',
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
            self::COD_FEE_DEDUCTION => '−',
            self::DEBT_PAYMENT => '↑',
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
            self::COD_FEE_DEDUCTION => 'amber',
            self::DEBT_PAYMENT => 'red',
        };
    }

    public function isIncome(): bool
    {
        return in_array($this, [self::TOP_UP, self::REFUND, self::INCOME]);
    }
}
