<?php

namespace App\Enums;

enum PriceType: string
{
    case FIXED = 'fixed';
    case RANGE = 'range';
    case STARTING = 'starting';

    public function label(): string
    {
        return match ($this) {
            self::FIXED => 'Harga Tetap',
            self::RANGE => 'Rentang Harga',
            self::STARTING => 'Mulai Dari',
        };
    }
}
