<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

<h1 align="center">🛍️ KampusMarket</h1>
<p align="center">
  <strong>Platform Marketplace Hyperlocal untuk Mahasiswa Universitas Brawijaya</strong>
  <br />
  Jual beli barang bekas dan jasa antar mahasiswa dengan mudah, aman, dan terpercaya.
  <br />
  <a href="https://github.com/username/ubazaar"><strong>Explore the Docs »</strong></a>
  <br />
  <br />
  <a href="#">View Demo</a>
  ·
  <a href="#">Report Bug</a>
  ·
  <a href="#">Request Feature</a>
</p>

<br />

<!-- TABLE OF CONTENTS -->
<details>
  <summary>📑 Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#sparkles-key-features">Key Features</a></li>
    <li><a href="#hammer_and_pick-built-with">Built With</a></li>
    <li><a href="#card_file_box-database-schema">Database Schema</a></li>
    <li><a href="#rocket-getting-started">Getting Started</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

---

## 🚀 About The Project

**UBazaar** adalah platform marketplace berbasis web yang dirancang khusus untuk ekosistem Universitas Brawijaya. Berbeda dengan marketplace umum, UBazaar mengedepankan konsep **Hyperlocal** dan **Trust**, di mana setiap user terverifikasi melalui fakultas mereka.

Proyek ini bertujuan untuk memfasilitasi:
*   **Jual Beli Barang Bekas:** Buku, elektronik, perlengkapan kos.
*   **Layanan Jasa:** Fotografi, desain, les privat, hingga teknisi.
*   **Transaksi Aman:** Sistem escrow dan verifikasi identitas kampus.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🎓 **Faculty Verification** | User wajib memilih fakultas (semi-permanen) untuk menjaga akuntabilitas. |
| 🤝 **In-Chat Negotiation** | Sistem tawar-menawar harga langsung di dalam chat tanpa tabel terpisah. |
| 💰 **Smart Admin Fee** | Biaya admin 5% dipotong dari **penjual** (seller), pembeli tidak dikenakan biaya tambahan. |
| 🛵 **Multi-Shipping** | Mendukung COD, Pickup, dan Delivery Manual dengan input ongkir oleh seller. |
| 📅 **Service Booking** | Fitur booking khusus untuk transaksi jasa dengan estimasi durasi. |
| 🔒 **Secure Wallet** | Sistem dompet digital dengan fitur withdrawal ke Bank & E-Wallet. |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛠️ Built With

Proyek ini dibangun menggunakan teknologi modern dan stack populer:

*   [![React][React.js]][React-url]
*   [![Vite][Vite.js]][Vite-url]
*   [![Tailwind CSS][Tailwind.com]][Tailwind-url]
*   [![TypeScript][TypeScript.org]][TypeScript-url]
*   [![Laravel][Laravel.com]][Laravel-url] (Backend API - Soon)
*   [![Prisma][Prisma.io]][Prisma-url] (ORM)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🗄️ Database Schema

Kami menggunakan **Prisma ORM** dengan database **MySQL**. Schema dirancang untuk mendukung fleksibilitas barang & jasa dalam satu entitas.

### Entity Relationship Diagram (ERD)
*(Kamu bisa embed gambar ERD dari mermaid atau screenshots di sini)*

### Highlight Models:
*   **User:** Menggunakan `googleId` untuk social login & `faculty` untuk verifikasi.
*   **Product:** Unified model untuk `Barang` dan `Jasa` (menggunakan field `type` & `priceMin/Max`).
*   **Order:** Mendukung snapshot produk dan `netIncome` calculation untuk seller.
*   **Message:** Mendukung tipe `offer` untuk sistem negosiasi.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🏁 Getting Started

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal kamu.

### Prerequisites
Pastikan kamu sudah menginstall Node.js dan Bun/npm.
*   Node.js >= 18.x
*   MySQL / SQLite (untuk development)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/username/ubazaar.git
    cd ubazaar
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    # or
    bun install
    ```

3.  **Setup Environment Variables**
    Buat file `.env` di root project:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/ubazaar"
    ```

4.  **Generate Prisma Client & Sync Database**
    ```sh
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the Development Server**
    ```sh
    npm run dev
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🤝 Contributing

Kontribusi sangat diterima! Jika kamu ingin berkontribusi, silakan fork repo ini dan buat pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
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
[Prisma.io]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
```