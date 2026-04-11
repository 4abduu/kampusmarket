import {
  MapPin,
  MessageCircle,
  Package,
  Shield,
  Truck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export const landingStats = [
  { icon: Users, value: "2,500+", label: "User Aktif" },
  { icon: Package, value: "5,000+", label: "Produk" },
  { icon: TrendingUp, value: "10,000+", label: "Transaksi" },
];

export const landingFeatures: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: MapPin,
    title: "Hyperlocal",
    desc: "Transaksi dengan penjual terdekat dari kampusmu",
  },
  {
    icon: MessageCircle,
    title: "Chat & Nego",
    desc: "Negosiasi harga langsung dengan penjual via chat",
  },
  {
    icon: Shield,
    title: "Escrow Aman",
    desc: "Dana ditahan sampai transaksi selesai",
  },
  {
    icon: Truck,
    title: "Pengiriman Fleksibel",
    desc: "COD, ketemuan, atau antar manual",
  },
];

export const buyerSteps = [
  { step: 1, title: "Cari Barang", desc: "Temukan barang atau jasa yang kamu butuhkan di katalog" },
  { step: 2, title: "Chat & Nego", desc: "Hubungi penjual, tanya detail, dan negosiasi harga" },
  { step: 3, title: "Checkout", desc: "Pilih metode pengiriman dan pembayaran yang diinginkan" },
  { step: 4, title: "Terima Barang", desc: "Ambil barang atau tunggu diantar, konfirmasi selesai" },
];

export const sellerSteps = [
  { step: 1, title: "Daftar Akun", desc: "Buat akun gratis dan lengkapi profil kamu" },
  { step: 2, title: "Unggah Produk", desc: "Upload foto, deskripsi, dan harga barang atau jasa" },
  { step: 3, title: "Kelola Pesanan", desc: "Respon chat, terima pesanan, dan atur pengiriman" },
  { step: 4, title: "Cairkan Dana", desc: "Dana masuk ke dompet, tarik ke rekening kapan saja" },
];
