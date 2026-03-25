<?php

namespace App\Enums;

enum ShippingType: string
{
    case COD = 'cod';
    case PICKUP = 'pickup';
    case DELIVERY = 'delivery';
    case ONLINE = 'online';
    case ONSITE = 'onsite';
    case HOME_SERVICE = 'home_service';

    public function label(): string
    {
        return match ($this) {
            self::COD => 'COD (Bayar di Tempat)',
            self::PICKUP => 'Ambil Sendiri',
            self::DELIVERY => 'Diantar',
            self::ONLINE => 'Online/Remote',
            self::ONSITE => 'Datang ke Lokasi',
            self::HOME_SERVICE => 'Home Service',
        };
    }
}
