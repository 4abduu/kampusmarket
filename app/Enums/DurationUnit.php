<?php

namespace App\Enums;

enum DurationUnit: string
{
    case JAM = 'jam';
    case HARI = 'hari';
    case MINGGU = 'minggu';
    case BULAN = 'bulan';

    public function label(): string
    {
        return match ($this) {
            self::JAM => 'Jam',
            self::HARI => 'Hari',
            self::MINGGU => 'Minggu',
            self::BULAN => 'Bulan',
        };
    }
}
