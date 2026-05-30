<?php

namespace App\Enums;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case RESOLVED = 'resolved';
    case DISMISSED = 'dismissed';
    case WARNING = 'warning';
    case BANNED = 'banned';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu',
            self::RESOLVED => 'Selesai',
            self::DISMISSED => 'Ditolak',
            self::WARNING => 'Warning',
            self::BANNED => 'Banned',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::RESOLVED => 'green',
            self::DISMISSED => 'gray',
            self::WARNING => 'amber',
            self::BANNED => 'red',
        };
    }
}
