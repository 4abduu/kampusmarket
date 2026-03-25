<?php

namespace App\Enums;

enum AvailabilityStatus: string
{
    case AVAILABLE = 'available';
    case BUSY = 'busy';
    case FULL = 'full';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Tersedia',
            self::BUSY => 'Sibuk',
            self::FULL => 'Penuh',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::AVAILABLE => 'green',
            self::BUSY => 'yellow',
            self::FULL => 'red',
        };
    }
}
