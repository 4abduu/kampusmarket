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
     * Convert Rupiah (tidak ada konversi, hanya untuk kompatibilitas)
     * Contoh: 100000 Rupiah → 100000 IDR
     */
    public static function toCent(int $rupiah): int
    {
        // DEPRECATED: Harga sudah disimpan langsung dalam IDR, tidak perlu dikali 100
        return $rupiah;
    }

    /**
     * Convert dari database value (tidak ada konversi, hanya untuk kompatibilitas)
     * Contoh: 100000 IDR → 100000 Rupiah
     */
    public static function toRupiah(int $idr): int
    {
        // DEPRECATED: Harga sudah dalam IDR, tidak perlu dibagi 100
        return $idr;
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
     * Format dari database (tidak ada konversi)
     * Contoh: 100000 IDR → "Rp 100.000"
     */
    public static function formatFromCent(int $idr): string
    {
        return self::format($idr);
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
