<?php

namespace App\Http\Helpers;

/**
 * Helper untuk generate nomor referensi
 */
class NumberGenerator
{
    /**
     * Generate Order Number
     * Format: KM-YYYYMMDD-XXXX
     */
    public static function orderNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "KM-{$date}-{$random}";
    }

    /**
     * Generate Withdrawal Number
     * Format: WD-YYYYMMDD-XXXX
     */
    public static function withdrawalNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "WD-{$date}-{$random}";
    }

    /**
     * Generate Report Number
     * Format: RP-YYYYMMDD-XXXX
     */
    public static function reportNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "RP-{$date}-{$random}";
    }

    /**
     * Generate Cancel Request Number
     * Format: CR-YYYYMMDD-XXXX
     */
    public static function cancelRequestNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "CR-{$date}-{$random}";
    }

    /**
     * Generate OTP (6 digits)
     */
    public static function otp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate UUID (v4)
     */
    public static function uuid(): string
    {
        return (string) \Illuminate\Support\Str::uuid();
    }

    /**
     * Generate Slug from string
     */
    public static function slug(string $title): string
    {
        return \Illuminate\Support\Str::slug($title);
    }

    /**
     * Generate unique slug (append number if exists)
     */
    public static function uniqueSlug(string $title, string $model, string $column = 'slug'): string
    {
        $slug = self::slug($title);
        $count = 1;

        while ($model::where($column, $slug)->exists()) {
            $slug = self::slug($title) . '-' . $count++;
        }

        return $slug;
    }
}
