<?php

namespace App\Http\Helpers;

/**
 * Helper untuk konversi mata uang
 * 
 * Semua harga di database disimpan dalam IDR langsung (bukan cent).
 * 
 * Contoh:
 * - Rp 100.000 = 100000 IDR
 * - Rp 1.500 = 1500 IDR
 */
class CurrencyHelper
{
    /**
     * Convert value to database format (direct IDR)
     */
    public static function toCent(int $idr): int
    {
        return $idr;
    }

    /**
     * Convert value from database format (direct IDR)
     */
    public static function toRupiah(int $idr): int
    {
        return $idr;
    }

    /**
     * Format ke string Rupiah
     * Contoh: 100000 → "Rp 100.000"
     */
    public static function format(int $idr): string
    {
        return 'Rp ' . number_format($idr, 0, ',', '.');
    }

    /**
     * Format dari database (IDR langsung)
     * Contoh: 100000 IDR → "Rp 100.000"
     */
    public static function formatFromCent(int $idr): string
    {
        return self::format($idr);
    }

    /**
     * Hitung biaya admin (5%)
     */
    public static function calculateAdminFee(int $price): int
    {
        return (int) round($price * 0.05);
    }

    /**
     * Hitung pendapatan bersih seller (harga - 5% admin fee)
     */
    public static function calculateNetIncome(int $price): int
    {
        return $price - self::calculateAdminFee($price);
    }

    /**
     * Hitung total harga untuk buyer (harga + ongkir)
     */
    public static function calculateTotalForBuyer(int $price, int $shippingFee = 0): int
    {
        return $price + $shippingFee;
    }
}
