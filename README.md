<div align="center">

# 🛍️ KampusMarket
**Platform Marketplace Hyperlocal untuk Mahasiswa Universitas Brawijaya**

Jual beli barang & jasa antar mahasiswa dengan sistem escrow aman, negosiasi realtime, dan pembayaran digital terintegrasi.

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

**KampusMarket** bukan marketplace biasa. Platform ini dirancang khusus untuk ekosistem kampus Universitas Brawijaya dengan menempatkan **identitas kampus sebagai inti kepercayaan**. 

Berbeda dari marketplace umum, KampusMarket memfasilitasi kebutuhan spesifik mahasiswa—mulai dari jual beli barang bekas, booking jasa (desain, fotografer, teknisi), hingga negosiasi harga—semuanya dalam satu ekosistem yang terverifikasi.

**Pilar Utama KampusMarket:**
- 🏫 **Hyperlocal & Trust-based** — User dikaitkan dengan fakultasnya, menjaga akuntabilitas setiap transaksi.
- 🤝 **Unified Account** — Satu akun untuk jadi Pembeli dan Penjual. Konteks UI menyesuaikan secara otomatis.
- ⚡ **Realtime Interaction** — Negosiasi harga dan koordinasi terjadi langsung di dalam chat.
- 🔒 **Escrow System** — Dana pembeli ditahan sistem, baru diteruskan ke penjual setelah transaksi selesai.

---

## ✨ Fitur Utama

### 💬 Komunikasi & Negosiasi Realtime
| Fitur | Deskripsi |
| :--- | :--- |
| 💬 **Realtime Chat (Reverb)** | Chat langsung antar user menggunakan WebSocket (Laravel Reverb + Echo). |
| ✍️ **Typing Indicator** | Menampilkan status “sedang mengetik” secara realtime. |
| ✔️ **Read Receipt** | Double tick (read) otomatis saat user membuka chat. |
| 🤝 **In-Chat Negotiation** | Tawar-menawar langsung di dalam chat. Harga deal otomatis ter-update ke order. |
| 🧠 **Optimistic UI** | Chat langsung muncul tanpa nunggu response server. |

### 🛍️ Transaksi, Order & Pembayaran
| Fitur | Deskripsi |
| :--- | :--- |
| 📦 **Unified Product** | Barang & Jasa dalam satu model produk (menggunakan field `type`). |
| 🚚 **Multi-Shipping Method** | Support COD, Antar Manual (input ongkir oleh seller), dan Ambil Sendiri. |
| 📅 **Service Booking** | Alur booking khusus jasa dengan penentuan harga oleh penyedia (Home Service / Online). |
| 🔒 **Secure Escrow** | Semua pembayaran digital ditahan sistem hingga pembeli konfirmasi selesai. |
| 💳 **Midtrans Payment** | Integrasi payment gateway untuk pembayaran & top-up saldo. |
| 💰 **Internal Wallet** | Dompet digital dengan fitur top-up & penarikan dana (withdrawal by Admin). |
| 🛡️ **Smart Cancellation** | Pembatalan sebelum bayar langsung otomatis. Setelah bayar wajib melalui mediasi Admin. |

### 🎨 UI, UX & Engineering
| Fitur | Deskripsi |
| :--- | :--- |
| 🧩 **shadcn/ui + Radix** | Komponen UI yang accessible, customizable, dan super modern. |
| 🐻 **Zustand + RHF** | State management yang ringan (Zustand) & form handling yang powerful (React Hook Form). |
| 📊 **Interactive Chart** | Dashboard admin & stats visual menggunakan Recharts. |

---

## 🛠️ Tech Stack

Proyek ini menggunakan teknologi paling modern di ekosistem web saat ini, menggabungkan kekuatan Laravel dengan elegant-nya React.

<div align="center">

### 🎨 Frontend Ecosystem
[![React][React.js]][React-url] &nbsp;
[![TypeScript][TypeScript.org]][TypeScript-url] &nbsp;
[![Vite][Vite.js]][Vite-url] &nbsp;
[![Tailwind CSS][Tailwind.com]][Tailwind-url] &nbsp;
[![shadcn][Shadcn.com]][Shadcn-url]

### ⚙️ Backend Ecosystem
[![Laravel][Laravel.com]][Laravel-url] &nbsp;
[![MySQL][MySQL.com]][MySQL-url] &nbsp;
[![Midtrans][Midtrans.com]][Midtrans-url]

</div>

<details>
<summary><b>📖 Detail Library & Tools</b></summary>

**Frontend (React + Vite)**
- **Core:** React 19, React Router v7, TypeScript 5.9
- **Styling & UI:** Tailwind CSS v4, shadcn/ui, Radix UI Primitives, Lucide Icons, Geist Font
- **State & Data:** Zustand, React Hook Form, Axios, Laravel Echo + Pusher-js
- **Utilities:** date-fns, Recharts, Sonner (Toasts), cmdk (Command Menu)

**Backend (Laravel 11)**
- **Core:** Laravel Framework 11, PHP 8.2+
- **Auth & Routing:** Laravel Sanctum (SPA Auth), Inertia.js, Ziggy (Route names to JS)
- **Realtime:** Laravel Reverb (WebSocket Server)
- **Payments:** Midtrans Core API
- **Code Quality:** Laravel Pint, PHPUnit, Spatie Ignition
</details>

---

## 🏗️ Arsitektur Sistem

Aplikasi menggunakan pendekatan **Modern Monolith** dengan Inertia.js yang menjembatani Laravel dan React tanpa harus menulis API ganda. Dilengkapi lapisan WebSocket untuk realtime dan Payment Gateway untuk keamanan finansial.

```text
┌─────────────────────────────────┐        ┌─────────────────────────┐
│          🎨 FRONTEND            │        │       ⚙️ BACKEND        │
│  React + Vite + TypeScript      │◄──────►│   Laravel 11 + Sanctum  │
│  shadcn/ui + Zustand + Geist    │ Inertia │   MySQL + Eloquent      │
│  React Hook Form + Ziggy Routes │--------►│   Inertia.js Adapter    │
└────────────┬────────────────────┘  SSR    └──────┬──────────────────┘
             │                                   │
             │                                   │ 3️⃣ Midtrans API (Webhook/Escrow)
             │                                   ▼
             │  2️⃣ Broadcast Event (Chat/Nego)  ┌─────────────┐
             │◀──────────────────────────────────┤ WebSocket   │
             │                                   │ (Reverb)    │
             └───────────────────────────────────┴─────────────┘
```

---

## 🏁 Getting Started

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer lokal kamu.

### 📋 Prerequisites
Pastikan software berikut sudah terinstall:
- PHP >= 8.2 & Composer
- Node.js >= 18.x
- MySQL
- Midtrans Sandbox Account

### 🚀 Installation

<details>
<summary><b>1. Clone Repository</b></summary>

```bash
git clone https://github.com/username/kampusmarket.git
cd kampusmarket
```
</details>

<details>
<summary><b>2. Setup Backend (Laravel)</b></summary>

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Konfigurasi penting di file `.env`:

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kampusmarket
DB_USERNAME=root
DB_PASSWORD=

# Frontend URL & Sanctum (Wajib diisi untuk SPA Auth)
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000
SESSION_DOMAIN=localhost

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Midtrans Sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
MIDTRANS_IS_SANDBOX=true

# Broadcasting & Queue (Penting untuk Chat & Event)
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

REVERB_APP_ID=kampusmarket
REVERB_APP_KEY=kampusmarket-key
REVERB_APP_SECRET=kampusmarket-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

Jalankan migrasi dan storage link:
```bash
php artisan migrate
php artisan storage:link
```

Jalankan server utama:
```bash
php artisan serve
```

*(Di terminal terpisah)* Jalankan Queue Worker & WebSocket Server:
```bash
php artisan queue:work
php artisan reverb:start
```
</details>

<details>
<summary><b>3. Setup Frontend (React + Vite)</b></summary>

Buka terminal baru di folder `frontend`:

```bash
cd frontend
npm install
```

Buat file `.env` di dalam folder `frontend`:

```env
VITE_API_BASE_URL=http://localhost:8000/api

# Midtrans Client
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
VITE_MIDTRANS_IS_SANDBOX=true

# Reverb WebSocket
VITE_REVERB_APP_KEY=kampusmarket-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Jalankan development server:
```bash
npm run dev
```
</details>

> **🔥 Penting:** 
> - Pastikan `php artisan reverb:start` dan `php artisan queue:work` berjalan di background agar fitur Chat Realtime & Payment Webhook berjalan lancar.
> - Jika WebSocket mati, chat masih bisa berjalan (fallback), namun **tidak realtime**.

---

## 🧠 Business Logic Highlights

Proyek ini memiliki alur bisnis yang dirancang khusus untuk kebutuhan marketplace kampus:

1. **Garis Pembayaran (Escrow Boundary):** Sebelum pembayaran, penjual bisa menolak langsung & pembeli bisa batal langsung. Setelah pembayaran, segala bentuk pembatalan **wajib melalui mediasi Admin** untuk keamanan dana escrow.
2. **Negosiasi via Chat:** Harga tawar (`nego_price`) tidak diinput sembarangan, melainkan di-deal langsung di dalam chat, yang kemudian sistem otomatis terapkan ke order.
3. **Alur Terpisah Barang vs Jasa:** 
   - **Barang:** Punya alur input ongkir manual oleh penjual (Antar Manual) dan bisa COD.
   - **Jasa:** Penyedia jasa wajib mengirimkan penawaran harga berdasarkan *brief* dari pemesan (status `waiting_price`). Jasa *Online/Remote* tidak mendukung COD.
4. **Dana Aman:** Biaya platform 5% dipotong dari pendapatan penjual saat dana escrow dicairkan, bukan ditambahkan ke tagihan pembeli.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[status-shield]: https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge
[status-url]: https://github.com/username/kampusmarket
[version-shield]: https://img.shields.io/badge/Version-0.1.0--Beta-blue?style=for-the-badge
[version-url]: https://github.com/username/kampusmarket
[license-shield]: https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge
[license-url]: https://github.com/username/kampusmarket/blob/main/LICENSE

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
[Midtrans.com]: https://img.shields.io/badge/Midtrans-0082C8?style=for-the-badge&logo=midtrans&logoColor=white
[Midtrans-url]: https://midtrans.com/
[Shadcn.com]: https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[Shadcn-url]: https://ui.shadcn.com/
