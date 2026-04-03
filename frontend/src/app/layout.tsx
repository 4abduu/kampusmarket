import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Title Template: Halaman Utama "KampusMarket" | Sub-halaman "Nama Produk - KampusMarket"
  title: {
    default: "KampusMarket - Marketplace Kampus Terpercaya",
    template: "%s | KampusMarket", 
  },
  
  // Deskripsi untuk SEO
  description: "Platform jual beli barang dan jasa antar mahasiswa terpercaya. Temukan produk unik, jasa profesional, dan promo menarik di kampusmu.",
  
  // Keywords untuk pencarian
  keywords: [
    "KampusMarket", 
    "Marketplace Mahasiswa", 
    "Jual Beli Kampus", 
    "Barang Bekas Mahasiswa", 
    "Jasa Freelance Mahasiswa", 
    "Next.js", 
    "Laravel API"
  ],
  
  // Author (Ganti dengan Nama Anda untuk TA)
  authors: [{ name: "Abdurrahman Ichwan, M. Ikhsan Putra A., Teuku Atha N. - Tugas Akhir" }],
  
  // Icon (Ganti dengan logo kampus atau logo proyek Anda)
  icons: {
    icon: "/favicon.ico", 
    // apple: "/apple-touch-icon.png",
  },
  
  // Open Graph (Untuk preview saat share link ke WhatsApp/Sosmed)
  openGraph: {
    title: "KampusMarket",
    description: "Marketplace digital untuk mahasiswa Indonesia. Aman, cepat, dan terpercaya.",
    url: "https://kampusmarket.test", // Ganti dengan domain Anda nanti
    siteName: "KampusMarket",
    // images: [{ url: "https://kampusmarket.test/og-image.png" }], // Tambahkan gambar preview jika ada
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "KampusMarket",
    description: "Platform jual beli barang dan jasa antar mahasiswa terpercaya.",
  },
  
  // Robots (Izinkan mesin pencari mengindeks jika sudah online)
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}