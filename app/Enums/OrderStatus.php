<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case WAITING_PRICE = 'waiting_price';
    case WAITING_CONFIRMATION = 'waiting_confirmation';
    case WAITING_SHIPPING_FEE = 'waiting_shipping_fee';
    case WAITING_PAYMENT = 'waiting_payment';
    case PROCESSING = 'processing';
    case READY_PICKUP = 'ready_pickup';
    case IN_DELIVERY = 'in_delivery';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu',
            self::WAITING_PRICE => 'Menunggu Harga',
            self::WAITING_CONFIRMATION => 'Menunggu Konfirmasi',
            self::WAITING_SHIPPING_FEE => 'Menunggu Ongkir',
            self::WAITING_PAYMENT => 'Menunggu Pembayaran',
            self::PROCESSING => 'Diproses',
            self::READY_PICKUP => 'Siap Diambil',
            self::IN_DELIVERY => 'Dalam Pengiriman',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::WAITING_PRICE => 'yellow',
            self::WAITING_CONFIRMATION => 'yellow',
            self::WAITING_SHIPPING_FEE => 'yellow',
            self::WAITING_PAYMENT => 'orange',
            self::PROCESSING => 'blue',
            self::READY_PICKUP => 'cyan',
            self::IN_DELIVERY => 'indigo',
            self::COMPLETED => 'green',
            self::CANCELLED => 'red',
        };
    }
}
