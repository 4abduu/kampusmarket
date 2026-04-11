<?php

namespace App\Enums;

enum CancelReason: string
{
    case CHANGED_MIND = 'changed_mind';
    case FOUND_BETTER_PRICE = 'found_better_price';
    case SELLER_NOT_RESPONDING = 'seller_not_responding';
    case ITEM_NOT_AS_DESCRIBED = 'item_not_as_described';
    case DELIVERY_TOO_LONG = 'delivery_too_long';
    case ASKED_OUTSIDE_PLATFORM = 'asked_outside_platform';
    case SHIPPING_METHOD_MISMATCH = 'shipping_method_mismatch';
    case SERVICE_SCOPE_CHANGED = 'service_scope_changed';
    case PORTFOLIO_NOT_MATCHING = 'portfolio_not_matching';
    case TIMELINE_NOT_FEASIBLE = 'timeline_not_feasible';
    case PROVIDER_COMMUNICATION_ISSUE = 'provider_communication_issue';
    case SCHEDULE_CONFLICT = 'schedule_conflict';
    case SHIPPING_FEE_TOO_HIGH = 'shipping_fee_too_high';
    case OUT_OF_STOCK = 'out_of_stock';
    case ADDRESS_UNREACHABLE = 'address_unreachable';
    case BUYER_NOT_RESPONDING = 'buyer_not_responding';
    case BUYER_NOT_SERIOUS = 'buyer_not_serious';
    case SUSPECTED_FRAUD = 'suspected_fraud';
    case ITEM_DAMAGED_BEFORE_SHIPPING = 'item_damaged_before_shipping';
    case SHIPPING_OPERATIONAL_ISSUE = 'shipping_operational_issue';
    case SERVICE_UNAVAILABLE = 'service_unavailable';
    case BRIEF_UNCLEAR_OR_CHANGED = 'brief_unclear_or_changed';
    case OUT_OF_SCOPE_REQUEST = 'out_of_scope_request';
    case SERVICE_LOCATION_NOT_FEASIBLE = 'service_location_not_feasible';
    case TEAM_UNAVAILABLE = 'team_unavailable';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::CHANGED_MIND => 'Berubah pikiran',
            self::FOUND_BETTER_PRICE => 'Menemukan harga lebih murah',
            self::SELLER_NOT_RESPONDING => 'Penjual tidak merespon',
            self::ITEM_NOT_AS_DESCRIBED => 'Barang tidak sesuai deskripsi',
            self::DELIVERY_TOO_LONG => 'Estimasi pengiriman terlalu lama',
            self::ASKED_OUTSIDE_PLATFORM => 'Diminta transaksi di luar platform',
            self::SHIPPING_METHOD_MISMATCH => 'Metode pengiriman tidak sesuai',
            self::SERVICE_SCOPE_CHANGED => 'Scope layanan berubah',
            self::PORTFOLIO_NOT_MATCHING => 'Portofolio tidak sesuai ekspektasi',
            self::TIMELINE_NOT_FEASIBLE => 'Waktu pengerjaan tidak memungkinkan',
            self::PROVIDER_COMMUNICATION_ISSUE => 'Komunikasi penyedia kurang jelas',
            self::SCHEDULE_CONFLICT => 'Jadwal tidak cocok',
            self::SHIPPING_FEE_TOO_HIGH => 'Ongkir terlalu mahal',
            self::OUT_OF_STOCK => 'Stok habis',
            self::ADDRESS_UNREACHABLE => 'Alamat tidak terjangkau',
            self::BUYER_NOT_RESPONDING => 'Pembeli tidak merespon',
            self::BUYER_NOT_SERIOUS => 'Indikasi pembeli tidak serius',
            self::SUSPECTED_FRAUD => 'Risiko penipuan terdeteksi',
            self::ITEM_DAMAGED_BEFORE_SHIPPING => 'Barang rusak sebelum dikirim',
            self::SHIPPING_OPERATIONAL_ISSUE => 'Kendala operasional pengiriman',
            self::SERVICE_UNAVAILABLE => 'Penyedia tidak tersedia',
            self::BRIEF_UNCLEAR_OR_CHANGED => 'Brief tidak jelas atau sering berubah',
            self::OUT_OF_SCOPE_REQUEST => 'Permintaan di luar scope awal',
            self::SERVICE_LOCATION_NOT_FEASIBLE => 'Lokasi atau jadwal eksekusi tidak feasible',
            self::TEAM_UNAVAILABLE => 'Ketersediaan tim mendadak berubah',
            self::OTHER => 'Lainnya',
        };
    }
}
