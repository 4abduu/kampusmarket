<?php

namespace App\Enums;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case REVIEWED = 'reviewed';
    case RESOLVED = 'resolved';
    case DISMISSED = 'dismissed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu',
            self::REVIEWED => 'Sedang Ditinjau',
            self::RESOLVED => 'Selesai',
            self::DISMISSED => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::REVIEWED => 'blue',
            self::RESOLVED => 'green',
            self::DISMISSED => 'gray',
        };
    }
}
