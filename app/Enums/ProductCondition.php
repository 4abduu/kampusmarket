<?php

namespace App\Enums;

enum ProductCondition: string
{
    case BARU = 'baru';
    case BEKAS = 'bekas';

    public function label(): string
    {
        return match ($this) {
            self::BARU => 'Baru',
            self::BEKAS => 'Bekas',
        };
    }
}
