<?php

namespace App\Enums;

enum ProductType: string
{
    case BARANG = 'barang';
    case JASA = 'jasa';

    public function label(): string
    {
        return match ($this) {
            self::BARANG => 'Barang',
            self::JASA => 'Jasa',
        };
    }
}
