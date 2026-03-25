<?php

namespace App\Enums;

enum ShippingOptionType: string
{
    case GRATIS = 'gratis';
    case PICKUP = 'pickup';
    case DELIVERY = 'delivery';

    public function label(): string
    {
        return match ($this) {
            self::GRATIS => 'Gratis',
            self::PICKUP => 'Ambil Sendiri',
            self::DELIVERY => 'Diantar',
        };
    }
}
