<?php

namespace App\Enums;

enum MessageType: string
{
    case TEXT = 'text';
    case OFFER = 'offer';
    case IMAGE = 'image';
    case FILE = 'file';
    case SYSTEM = 'system';

    public function label(): string
    {
        return match ($this) {
            self::TEXT => 'Teks',
            self::OFFER => 'Penawaran',
            self::IMAGE => 'Gambar',
            self::FILE => 'File',
            self::SYSTEM => 'Sistem',
        };
    }
}
