<?php

namespace App\Http\Helpers;

/**
 * Helper untuk konversi mata uang
 * 
 * Semua harga di database disimpan dalam CENT (Rupiah * 100)
 * untuk menghindari floating point errors.
 * 
 * Contoh:
 * - Rp 100.000 = 10.000.000 cent
 * - Rp 1.500 = 150.000 cent
 */
class CurrencyHelper
{
    /**
     * Konversi Rupiah ke Cent
     * Contoh: 100000 Rupiah → 10000000 Cent
     */
    public static function toCent(int $rupiah): int
    {
        return $rupiah * 100;
    }

    /**
     * Konversi Cent ke Rupiah
     * Contoh: 10000000 Cent → 100000 Rupiah
     */
    public static function toRupiah(int $cent): int
    {
        return (int) ($cent / 100);
    }

    /**
     * Format ke string Rupiah
     * Contoh: 100000 → "Rp 100.000"
     */
    public static function format(int $rupiah): string
    {
        return 'Rp ' . number_format($rupiah, 0, ',', '.');
    }

    /**
     * Format dari Cent ke string Rupiah
     * Contoh: 10000000 Cent → "Rp 100.000"
     */
    public static function formatFromCent(int $cent): string
    {
        return self::format(self::toRupiah($cent));
    }

    /**
     * Hitung biaya admin (5%)
     */
    public static function calculateAdminFee(int $priceInCent): int
    {
        return (int) round($priceInCent * 0.05);
    }

    /**
     * Hitung pendapatan bersih seller (harga - 5% admin fee)
     */
    public static function calculateNetIncome(int $priceInCent): int
    {
        return $priceInCent - self::calculateAdminFee($priceInCent);
    }

    /**
     * Hitung total harga untuk buyer (harga + ongkir)
     */
    public static function calculateTotalForBuyer(int $priceInCent, int $shippingFeeInCent = 0): int
    {
        return $priceInCent + $shippingFeeInCent;
    }
}
