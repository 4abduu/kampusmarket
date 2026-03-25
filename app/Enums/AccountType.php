<?php

namespace App\Enums;

enum AccountType: string
{
    case BANK = 'bank';
    case E_WALLET = 'e_wallet';

    public function label(): string
    {
        return match ($this) {
            self::BANK => 'Rekening Bank',
            self::E_WALLET => 'E-Wallet',
        };
    }
}
