<?php

namespace App\Enums;

enum CancelReason: string
{
    case CHANGED_MIND = 'changed_mind';
    case FOUND_BETTER_PRICE = 'found_better_price';
    case SELLER_NOT_RESPONDING = 'seller_not_responding';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::CHANGED_MIND => 'Berubah pikiran',
            self::FOUND_BETTER_PRICE => 'Menemukan harga lebih murah',
            self::SELLER_NOT_RESPONDING => 'Penjual tidak merespon',
            self::OTHER => 'Lainnya',
        };
    }
}
