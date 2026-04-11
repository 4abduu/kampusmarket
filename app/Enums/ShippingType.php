<?php

namespace App\Enums;

enum ShippingType: string
{
    case GRATIS = 'gratis';
    case COD = 'cod';
    case PICKUP = 'pickup';
    case DELIVERY = 'delivery';
    case ONLINE = 'online';
    case ONSITE = 'onsite';
    case HOME_SERVICE = 'home_service';

    public function label(): string
    {
        return match ($this) {
            self::GRATIS => 'Gratis',
            self::COD => 'COD (Bayar di Tempat)',
            self::PICKUP => 'Ambil Sendiri',
            self::DELIVERY => 'Antar Manual',
            self::ONLINE => 'Online',
            self::ONSITE => 'Ke Lokasi Penyedia Jasa',
            self::HOME_SERVICE => 'Home Service',
        };
    }
}
