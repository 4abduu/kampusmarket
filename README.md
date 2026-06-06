<div align="center">

# 🛍️ KampusMarket
**Platform Marketplace untuk Ekosistem Kampus**

Jual beli barang baru & bekas, booking jasa, negosiasi harga realtime, dan pembayaran digital dengan sistem escrow — semua dalam satu platform terintegrasi.

[![Status][status-shield]][status-url]
[![Version][version-shield]][version-url]
[![License][license-shield]][license-url]

<br />

[🎯 View Demo](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

<br />

> **⚠️ Note:** Proyek ini masih dalam tahap aktif pengembangan (Beta). Fitur, business logic, dan API masih dapat berubah sebelum versi 1.0.0 dirilis.

</div>

---

## 🎯 Tentang Proyek Ini

**KampusMarket** adalah platform marketplace berbasis web yang dirancang untuk kebutuhan dan konteks kehidupan kampus. Platform ini dapat digunakan oleh mahasiswa aktif, alumni, maupun masyarakat sekitar kampus yang memiliki kebutuhan atau penawaran yang relevan dengan ekosistem kampus.

Setiap pengguna mengidentifikasi diri dengan fakultasnya sebagai bagian dari profil akun — menjadikan setiap transaksi berlangsung dalam komunitas yang lebih terarah dan akuntabel dibanding marketplace anonim.

**Pilar Utama KampusMarket:**
- 🏫 **Konteks Kampus** — Setiap user dikaitkan dengan fakultasnya, mendorong akuntabilitas dalam setiap transaksi.
- 🤝 **Unified Account** — Satu akun untuk jadi Pembeli sekaligus Penjual. Konteks UI menyesuaikan secara otomatis.
- ⚡ **Realtime Interaction** — Negosiasi harga dan koordinasi terjadi langsung di dalam chat secara realtime.
- 🔒 **Escrow System** — Dana pembeli ditahan sistem, baru diteruskan ke penjual setelah transaksi dikonfirmasi selesai.

---

## ✨ Fitur Utama

### 💬 Komunikasi & Negosiasi Realtime
| Fitur | Deskripsi |
| :--- | :--- |
| 💬 **Realtime Chat** | Chat langsung antar user menggunakan WebSocket (Pusher + Laravel Echo). |
| ✍️ **Typing Indicator** | Menampilkan status "sedang mengetik" secara realtime. |
| ✔️ **Read Receipt** | Tanda baca otomatis saat user membuka chat. |
| 🤝 **In-Chat Negotiation** | Tawar-menawar langsung di dalam chat maupun dari halaman detail produk. Harga deal otomatis ter-update ke order. |
| 🧠 **Optimistic UI** | Chat langsung muncul tanpa menunggu response server. |

### 🛍️ Transaksi, Order & Pembayaran
| Fitur | Deskripsi |
| :--- | :--- |
| 📦 **Barang & Jasa** | Mendukung dua tipe produk: barang (baru/bekas) dan jasa, masing-masing dengan alur transaksi yang berbeda. |
| 🚚 **Multi-Shipping Method** | Barang: COD, Antar Manual (input ongkir oleh penjual), Ambil Sendiri. Jasa: Ke Lokasi Penyedia, Home Service, Online/Remote. |
| 📅 **Service Booking** | Alur booking khusus jasa dengan penawaran harga oleh penyedia berdasarkan brief dari pemesan. |
| 🔒 **Secure Escrow** | Semua pembayaran digital ditahan sistem hingga pembeli konfirmasi selesai, dikurangi fee platform 5%. |
| 💳 **Midtrans Payment** | Integrasi Midtrans Snap untuk pembayaran order dan top-up saldo (virtual account, QRIS, dll). |
| 💰 **Internal Wallet** | Dompet digital dengan PIN, top-up via Midtrans, dan penarikan dana yang diproses admin. |
| 🧾 **Komisi COD** | Transaksi COD menghasilkan tagihan komisi 5% (CodInvoice) yang harus dilunasi penjual setelah order selesai. |
| 🛡️ **Smart Cancellation** | Pembatalan sebelum bayar langsung otomatis. Setelah bayar wajib melalui mediasi Admin dengan refund otomatis ke dompet. |

### 👤 Pengguna & Profil
| Fitur | Deskripsi |
| :--- | :--- |
| 🔐 **Multi-Auth** | Login via email/password atau Google OAuth. Verifikasi email via OTP. Reset password via OTP. |
| 🏫 **Identitas Fakultas** | Setiap user mengidentifikasi diri dengan fakultas sebagai bagian dari profil publik. |
| ⭐ **Rating & Ulasan** | Ulasan dengan rating bintang, komentar, dan foto — hanya bisa diberikan setelah transaksi selesai. |
| 🚩 **Sistem Laporan** | Laporan terhadap user, produk, atau konten chat dengan alur moderasi admin. |
| ❤️ **Favorit** | Simpan produk/jasa ke wishlist untuk diakses kembali kapan saja. |

### 🎨 UI, UX & Engineering
| Fitur | Deskripsi |
| :--- | :--- |
| 🧩 **shadcn/ui + Radix** | Komponen UI yang accessible, customizable, dan konsisten. |
| 🐻 **Zustand** | State management ringan untuk cart, notifikasi, favorit, auth, dan chat. |
| 📊 **Interactive Chart** | Dashboard admin dengan statistik visual menggunakan Recharts. |
| 🖼️ **WebP + Lightbox** | Gambar produk dikonversi otomatis ke WebP, didukung lightbox dengan zoom. |
| 🔔 **Realtime Notifications** | Notifikasi aktivitas order, chat, pembayaran, dan ulasan secara realtime via Pusher. |
| ⚙️ **Queue-based Jobs** | Notifikasi, auto-confirm, dan auto-cancel order diproses via Laravel Queue. |

---

## 🛠️ Tech Stack

<div align="center">

### 🎨 Frontend
[![React][React.js]][React-url] &nbsp;
[![TypeScript][TypeScript.org]][TypeScript-url] &nbsp;
[![Vite][Vite.js]][Vite-url] &nbsp;
[![Tailwind CSS][Tailwind.com]][Tailwind-url] &nbsp;
[![shadcn][Shadcn.com]][Shadcn-url]

### ⚙️ Backend
[![Laravel][Laravel.com]][Laravel-url] &nbsp;
[![MySQL][MySQL.com]][MySQL-url] &nbsp;
[![Midtrans][Midtrans.com]][Midtrans-url]

</div>

<details>
<summary><b>📖 Detail Library & Tools</b></summary>

**Frontend (React + Vite)**
- **Core:** React 19, React Router v7, TypeScript 5.9
- **Styling & UI:** Tailwind CSS v4, shadcn/ui, Radix UI Primitives, Lucide Icons, Geist Font
- **State & Data:** Zustand, Axios, Laravel Echo + Pusher-js
- **Utilities:** date-fns, Recharts, Sonner (Toasts), yet-another-react-lightbox, react-easy-crop

**Backend (Laravel 11)**
- **Core:** Laravel 11, PHP 8.2+
- **Auth:** Laravel Sanctum (HttpOnly Cookie SPA Auth), Laravel Socialite (Google OAuth)
- **Realtime:** Pusher (production), Laravel Reverb (local)
- **Payments:** Midtrans Snap
- **Queue:** Laravel Queue (database driver)
- **Email:** SMTP Gmail / Resend
- **Image:** Intervention Image (WebP conversion)

**Infrastructure**
- **Backend:** Railway
- **Frontend:** Vercel
- **Database:** MySQL
- **WebSocket:** Pusher
</details>

---

## 🏗️ Arsitektur Sistem

Aplikasi menggunakan pendekatan **Decoupled SPA** — Laravel sebagai pure REST API backend, React sebagai frontend yang berkomunikasi via Axios. Autentikasi menggunakan HttpOnly cookie via Laravel Sanctum.

```text
┌──────────────────────────────────┐        ┌──────────────────────────────┐
│          🎨 FRONTEND             │        │        ⚙️ BACKEND            │
│  React 19 + Vite + TypeScript    │        │   Laravel 11 + Sanctum       │
│  shadcn/ui + Zustand             │◄──────►│   MySQL + Eloquent ORM       │
│  Tailwind CSS v4 + Geist Font    │  REST  │   Queue (database driver)    │
│  Deployed: Vercel                │  API   │   Deployed: Railway          │
└───────────────┬──────────────────┘        └──────┬───────────────────────┘
                │                                  │
                │  WebSocket (Pusher)               │ Webhook
                │◄─────────────────────────────────┤
                │                                  │
                │                          ┌───────┴──────────┐
                │                          │  External Services│
                │                          │  - Midtrans Snap  │
                │                          │  - Pusher         │
                │                          │  - Google OAuth   │
                │                          │  - SMTP / Resend  │
                └──────────────────────────┴───────────────────┘
```

---

## 🏁 Getting Started

### 📋 Prerequisites
- PHP >= 8.2 & Composer
- Node.js >= 18.x
- MySQL
- Midtrans Sandbox Account
- Pusher Account (untuk WebSocket)

### 🚀 Installation

<details>
<summary><b>1. Clone Repository</b></summary>

```bash
git clone https://github.com/4abduu/kampusmarket.git
cd kampusmarket
```
</details>

<details>
<summary><b>2. Setup Backend (Laravel)</b></summary>

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Konfigurasi penting di file `.env` (lihat `.env.example` untuk template lengkap):

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kampusmarket
DB_USERNAME=root
DB_PASSWORD=

# Session & Cache
SESSION_DRIVER=file        # Ganti ke 'database' untuk deployment Railway
CACHE_STORE=database

# Sanctum & CORS
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:8000,127.0.0.1:8000
SESSION_DOMAIN=            # Kosongkan untuk lokal, isi domain utama untuk production

# Email
# Lokal  : gunakan SMTP Gmail (MAIL_MAILER=smtp)
# Deploy : gunakan Resend (MAIL_MAILER=resend + RESEND_API_KEY)
#          Railway memblokir koneksi SMTP standar
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=emailanda@gmail.com
MAIL_PASSWORD=             # App Password Gmail (16 karakter)
MAIL_FROM_ADDRESS="${MAIL_USERNAME}"
MAIL_FROM_NAME="${APP_NAME}"

# Google OAuth
# Buat credentials di: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Midtrans
# MIDTRANS_IS_SANDBOX=true  → Sandbox (development)
# MIDTRANS_IS_SANDBOX=false → Production
MIDTRANS_SERVER_KEY=SB-Mid-server-your-server-key
MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key
MIDTRANS_IS_SANDBOX=true

# Pusher (WebSocket)
# Pusher digunakan agar tidak perlu menjalankan proses tambahan.
# Jika ingin pakai Reverb di lokal, ubah BROADCAST_CONNECTION=reverb
# dan uncomment bagian REVERB di .env.example
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=ap1
PUSHER_SCHEME=https
PUSHER_PORT=443

# Queue
QUEUE_CONNECTION=database
```

Jalankan migrasi dan storage link:
```bash
php artisan migrate
php artisan storage:link
```

Jalankan server:
```bash
php artisan serve
```

*(Di terminal terpisah)* Jalankan Queue Worker:
```bash
php artisan queue:work
```
</details>

<details>
<summary><b>3. Setup Frontend (React + Vite)</b></summary>

```bash
cd frontend
npm install
```

Buat file `.env` di dalam folder `frontend` (lihat `.env.example` untuk template lengkap):

```env
# Arahkan ke URL backend yang sedang digunakan
# Lokal  : http://localhost:8000/api
# Deploy : https://your-backend.up.railway.app/api
VITE_API_BASE_URL=http://localhost:8000/api

# Midtrans
# VITE_MIDTRANS_IS_SANDBOX=true  → Sandbox (development)
# VITE_MIDTRANS_IS_SANDBOX=false → Production
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key
VITE_MIDTRANS_IS_SANDBOX=true

# Pusher — gunakan App Key dan Cluster yang sama dengan backend
VITE_PUSHER_APP_KEY=your-app-key
VITE_PUSHER_APP_CLUSTER=ap1
```

Jalankan development server:
```bash
npm run dev
```
</details>

> **🔥 Penting:**
> - Pastikan `php artisan queue:work` berjalan agar notifikasi realtime, auto-confirm, dan auto-cancel order berfungsi.
> - Untuk development lokal, bisa pakai Laravel Reverb sebagai pengganti Pusher — sesuaikan `BROADCAST_CONNECTION=reverb` dan konfigurasi Reverb di `.env`.

---

## 🧠 Business Logic Highlights

1. **Escrow Boundary:** Sebelum pembayaran, penjual bisa menolak langsung dan pembeli bisa batal langsung. Setelah pembayaran, segala bentuk pembatalan **wajib melalui mediasi Admin** — refund otomatis ke dompet pembeli setelah disetujui.

2. **Negosiasi via Chat:** Harga tawar (`nego_price`) di-deal langsung di dalam chat via pesan tipe `offer`, bisa juga diinisiasi dari tombol "Tawar Harga" di halaman detail produk. Harga yang disepakati otomatis diterapkan ke order.

3. **Alur Terpisah Barang vs Jasa:**
   - **Barang:** Mendukung COD, Antar Manual (input ongkir oleh penjual), dan Ambil Sendiri.
   - **Jasa:** Penyedia wajib mengirim penawaran harga berdasarkan brief pemesan (`waiting_price`). Jasa Online/Remote tidak mendukung COD.

4. **Komisi COD:** Karena transaksi COD tidak melewati escrow, setelah order selesai sistem membuat `CodInvoice` senilai 5% yang harus dilunasi penjual. Jika melewati jatuh tempo, akses transaksi dibatasi hingga tunggakan dilunasi.

5. **Fee Platform:** Biaya platform 5% dipotong dari pendapatan penjual saat dana escrow dicairkan — tidak ditambahkan ke tagihan pembeli.

6. **Satu Chat per Pasangan User:** Satu percakapan per pasangan buyer-seller, tidak terikat ke produk spesifik. Konteks produk bisa disertakan di level pesan.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[status-shield]: https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge
[status-url]: https://github.com/4abduu/kampusmarket
[version-shield]: https://img.shields.io/badge/Version-0.1.0--Beta-blue?style=for-the-badge
[version-url]: https://github.com/4abduu/kampusmarket
[license-shield]: https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge
[license-url]: https://github.com/4abduu/kampusmarket/blob/main/LICENSE

[React.js]: https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Tailwind.com]: https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[TypeScript.org]: https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Laravel.com]: https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com/
[MySQL.com]: https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white
[MySQL-url]: https://www.mysql.com/
[Midtrans.com]: https://img.shields.io/badge/Midtrans-0082C8?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==&logoColor=white
[Midtrans-url]: https://midtrans.com/
[Shadcn.com]: https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[Shadcn-url]: https://ui.shadcn.com/
