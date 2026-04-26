<div align="center">

# 🛍️ KampusMarket
**Platform Marketplace Hyperlocal untuk Mahasiswa Universitas Brawijaya**

Jual beli barang & jasa antar mahasiswa dengan sistem chat realtime, negosiasi langsung, dan transaksi aman.

[![Status][status-shield]][status-url]
[![Version][version-shield]][version-url]
[![License][license-shield]][license-url]

<br />

[🎯 View Demo](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

<br />

> **⚠️ Note:** Proyek ini masih dalam tahap aktif pengembangan (Beta). Fitur dan API masih dapat berubah sebelum versi 1.0.0 dirilis.

</div>

---

## 🎯 Tentang Proyek Ini

**KampusMarket** bukan sekadar marketplace biasa. Platform ini dirancang khusus untuk ekosistem kampus Universitas Brawijaya dengan mengedepankan tiga pilar utama:

🏫 **Hyperlocal** — Fokus hanya untuk ekosistem kampus UB.  
🤝 **Trust-based** — User teridentifikasi jelas berdasarkan fakultas.  
⚡ **Realtime** — Komunikasi dan negosiasi terjadi secara langsung.

Apa yang bisa kamu lakukan di KampusMarket?
- 🛍️ Jual beli barang bekas (buku, elektronik, perlengkapan kos)
- 🧑‍💻 Tawarkan layanan jasa (desain, fotografi, les privat)
- 💬 Negosiasi harga langsung via chat realtime
- 💰 Transaksi aman dengan sistem harga fleksibel

---

## ✨ Fitur Utama

<div align="center">

| 💬 Realtime & Chat | 🤝 Transaksi & Produk | 🧠 UX & System |
| :--- | :--- | :--- |
| 💬 **Realtime Chat** via Laravel Reverb | 📦 **Unified Product** (Barang & Jasa dalam satu model) | 🧠 **Optimistic UI** (Chat tanpa delay) |
| ✍️ **Typing Indicator** (Sedang mengetik) | 🧾 **Offer System** (Tawar harga di chat) | 🏫 **Faculty Verified** (Akuntabilitas user) |
| ✔️ **Read Receipt** (Double tick / dibaca) | 🛵 **Flexible Shipping** (COD, Pickup, Delivery) | 🔒 **Secure Auth** (Login terproteksi) |

</div>

---

## 🛠️ Tech Stack

Proyek ini menggunakan arsitektur modern yang memisahkan antara Frontend dan Backend.

<div align="center">

### 🎨 Frontend
[![React][React.js]][React-url] &nbsp;
[![Vite][Vite.js]][Vite-url] &nbsp;
[![TypeScript][TypeScript.org]][TypeScript-url] &nbsp;
[![Tailwind CSS][Tailwind.com]][Tailwind-url]

### ⚙️ Backend & Database
[![Laravel][Laravel.com]][Laravel-url] &nbsp;
[![MySQL][MySQL.com]][MySQL-url]

</div>

---

## 🏗️ Arsitektur & Realtime Flow

Kami menggunakan **Laravel Reverb** untuk menangani komunikasi realtime secara native tanpa layanan pihak ketiga.

```text
┌─────────────────────────┐        ┌─────────────────────────┐
│      🎨 FRONTEND        │        │       ⚙️ BACKEND        │
│   React + Vite + TS     │        │   Laravel + Eloquent    │
│   Tailwind + Echo JS    │        │   MySQL + Reverb WS     │
└────────────┬────────────┘        └────────────┬────────────┘
             │                                   │
             │  1️⃣ REST API (Axios)             │
             │ ─────────────────────────────────▶│
             │                                   │
             │  2️⃣ Broadcast Event (MessageSent) │
             │◀──────────────────────────────────│
             │                                   │
             │      ┌───────────────┐            │
             │      │  WebSocket    │            │
             └──────┤  (Reverb)     ├────────────┘
                    └───────────────┘
```

**Cara kerja Realtime Chat:**
1. User A kirim pesan → Server Laravel menerima via REST API.
2. Laravel mem-broadcast event `MessageSent`.
3. Server Reverb meneruskan event via WebSocket ke User B.
4. UI User B ter-update secara instan (Optimistic UI).

---

## 🏁 Getting Started

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer lokal kamu.

### 📋 Prerequisites
Pastikan software berikut sudah terinstall:
- Node.js >= 18.x
- PHP >= 8.1
- Composer
- MySQL

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

Buka terminal di folder `backend`:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Konfigurasi database dan Reverb di file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kampusmarket
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=reverb
QUEUE_CONNECTION=sync
```

Jalankan migrasi dan server:
```bash
php artisan migrate
php artisan serve
```

*(Di terminal terpisah)* Jalankan WebSocket Server:
```bash
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

VITE_REVERB_APP_KEY=your-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Jalankan development server:
```bash
npm run dev
```
</details>

> **🔥 Penting:** Jika Reverb server tidak dijalankan, chat masih bisa muncul (via fallback/polling), namun **tidak akan realtime**.

---

## 🤝 Contributing

Kontribusi selalu terbuka! Mari bikin KampusMarket makin keren bersama.

1. 🍴 Fork the Project
2. 🔧 Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the Branch (`git push origin feature/AmazingFeature`)
5. 📮 Open a Pull Request

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

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Tailwind.com]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[TypeScript.org]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com/
[MySQL.com]: https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white
[MySQL-url]: https://www.mysql.com/