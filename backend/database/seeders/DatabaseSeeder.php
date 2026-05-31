<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Faculty;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ShippingOption;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * - Fresh marketplace: 0 rating, 0 sold, 0 notifications
     * - Shipping/service methods arranged for checkout flow validation
     * - Users spread across faculties for realistic data
     * - Addresses seeded for delivery checkout testing
     */
    public function run(): void
    {
        // ─── FACULTIES (sudah ada dari migration) ─────────────────────────────
        $facVokasi = Faculty::where('code', 'vokasi')->first();
        $facFeb    = Faculty::where('code', 'feb')->first();
        $facFilkom = Faculty::where('code', 'filkom')->first();
        $facFt     = Faculty::where('code', 'ft')->first();
        $facFmipa  = Faculty::where('code', 'fmipa')->first();
        $facFisip  = Faculty::where('code', 'fisip')->first();

        // ─── ADMIN ─────────────────────────────────────────────────────────────
        $admin = User::where('email', 'admin@kampusmarket.com')->first();
        if (!$admin) {
            $admin = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Super Admin',
                'email' => 'admin@kampusmarket.com',
                'password' => Hash::make('admin123'),
                'phone' => '081234567890',
                'faculty_id' => null,
                'location' => 'Malang',
                'role' => 'admin',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        // ─── USERS (spread across faculties) ───────────────────────────────────
        $ahmad = $this->firstOrCreateUser('ahmad@student.ub.ac.id', [
            'name' => "Ahmad Rifa'i", 'phone' => '082234567890', 'faculty_id' => $facFilkom?->id,
        ]);
        $siti = $this->firstOrCreateUser('siti@student.ub.ac.id', [
            'name' => 'Siti Nurhaliza', 'phone' => '082245678901', 'faculty_id' => $facFeb?->id,
        ]);
        $budi = $this->firstOrCreateUser('budi@student.ub.ac.id', [
            'name' => 'Budi Hartono', 'phone' => '082256789012', 'faculty_id' => $facFt?->id,
        ]);
        $dewi = $this->firstOrCreateUser('dewi@student.ub.ac.id', [
            'name' => 'Dewi Lestari', 'phone' => '082267890123', 'faculty_id' => $facFmipa?->id,
        ]);
        $reza = $this->firstOrCreateUser('reza@student.ub.ac.id', [
            'name' => 'Reza Prawira', 'phone' => '082278901234', 'faculty_id' => $facFisip?->id,
        ]);
        $seller = $this->firstOrCreateUser('seller@example.com', [
            'name' => 'Penjual Test', 'phone' => '082289012345', 'faculty_id' => $facFilkom?->id,
        ]);
        $buyer = $this->firstOrCreateUser('buyer@student.ub.ac.id', [
            'name' => 'Fajar Pembeli', 'phone' => '082290123456', 'faculty_id' => $facFilkom?->id,
        ]);

        // ─── ADDRESSES (for delivery checkout testing) ─────────────────────────
        $this->seedAddresses($buyer);
        $this->seedAddresses($ahmad);

        // ─── CATEGORIES (sudah ada dari migration) ────────────────────────────
        $catElektronik = Category::where('slug', 'elektronik')->first();
        $catBuku       = Category::where('slug', 'buku')->first();
        $catFashion    = Category::where('slug', 'fashion')->first();
        $catFurniture  = Category::where('slug', 'furniture')->first();
        $catOlahraga   = Category::where('slug', 'olahraga')->first();
        $catKendaraan  = Category::where('slug', 'kendaraan')->first();
        $catFoto       = Category::where('slug', 'fotografi-video')->first();
        $catLes        = Category::where('slug', 'pendidikan-les')->first();
        $catDesain     = Category::where('slug', 'desain-kreatif')->first();
        $catTeknisi    = Category::where('slug', 'teknisi-servis')->first();
        $catKecantikan = Category::where('slug', 'kecantikan')->first();

        // ─── BARANG ────────────────────────────────────────────────────────────
        //
        // CHECKOUT TEST MATRIX — BARANG (Metode Pengiriman):
        // +----------------------------------+-----+--------+-----------+
        // | Product                          | COD | Pickup | Delivery  |
        // +----------------------------------+-----+--------+-----------+
        // | Kalkulator Casio FX-991EX        |  Y  |   Y    |    Y      | <- All 3
        // | Buku Kalkulus Purcell            |  Y  |   Y    |    Y      | <- All 3
        // | Jaket Almamater UB              |  Y  |   Y    |    N      | <- COD + Pickup
        // | Mouse Logitech MX Master 3       |  Y  |   Y    |    N      | <- COD + Pickup
        // | Kamera Sony A6000               |  Y  |   Y    |    N      | <- COD + Pickup
        // | Meja Belajar Portable            |  N  |   Y    |    Y      | <- Pickup + Delivery
        // | Sepatu Futsal Nike              |  N  |   Y    |    Y      | <- Pickup + Delivery
        // | Paket Buku Akuntansi             |  Y  |   N    |    Y      | <- COD + Delivery
        // | Laptop Asus VivoBook 14          |  Y  |   N    |    Y      | <- COD + Delivery
        // | Headphone Sony WH-1000XM4       |  Y  |   Y    |    Y      | <- All 3
        // | Helm LS2 FF800 (BARU)           |  Y  |   Y    |    Y      | <- All 3, condition=baru
        // | Sepeda Mini Bekas (SOLD OUT)     |  Y  |   Y    |    N      | <- stock=0, sold_out
        // +----------------------------------+-----+--------+-----------+

        // All 3 methods — bekas
        $this->createBarang($siti, $catElektronik,
            'Kalkulator Scientific Casio FX-991EX',
            'Kalkulator scientific Casio FX-991EX kondisi sangat bagus. Masih ada dus dan buku manual. Cocok untuk mahasiswa teknik dan sains.',
            180000, 250000, 'bekas', true, 5,
            ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400'],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 5000],
            ],
            weight: 200
        );

        // All 3 methods — bekas
        $this->createBarang($dewi, $catBuku,
            'Buku Kalkulus Purcell Edisi 9',
            'Buku Kalkulus Purcell edisi 9 jilid 1 dan 2. Kondisi baik, ada beberapa stabilo. Lengkap dengan soal-soal latihan.',
            85000, 150000, 'bekas', true, 4,
            ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 5000],
            ],
            weight: 800
        );

        // COD + Pickup only
        $this->createBarang($siti, $catFashion,
            'Jaket Almamater Universitas Brawijaya',
            'Jaket almamater UB ukuran L. Kondisi sangat bagus, hanya dipakai beberapa kali untuk acara resmi. Warna masih cerah.',
            150000, 250000, 'bekas', true, 3,
            ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'],
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        // COD + Pickup only
        $this->createBarang($siti, $catElektronik,
            'Mouse Wireless Logitech MX Master 3',
            'Mouse Logitech MX Master 3 kondisi sangat bagus. Beli baru 6 bulan lalu. Scrolling ultra smooth, ergonomis.',
            550000, 900000, 'bekas', false, 2,
            ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ],
            weight: 150
        );

        // Pickup + Delivery only (no COD)
        $this->createBarang($ahmad, $catFurniture,
            'Meja Belajar Portable Lipat Kayu',
            'Meja belajar portable lipat dari kayu jati belanda. Ringan dan mudah dibawa. Cocok untuk belajar di kos. Ukuran 60x40cm.',
            120000, null, 'bekas', false, 2,
            ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'],
            [
                ['type' => 'pickup',   'label' => 'Ambil Sendiri', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',  'price' => 10000],
            ],
            weight: 5000
        );

        // Pickup + Delivery only (no COD)
        $this->createBarang($ahmad, $catOlahraga,
            'Sepatu Futsal Nike Tiempo Lunar',
            'Sepatu futsal Nike Tiempo Lunar ukuran 42. Kondisi 80%, sol masih bagus. Cocok untuk futsal rutin.',
            180000, 400000, 'bekas', true, 1,
            ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
            [
                ['type' => 'pickup',   'label' => 'Ambil Sendiri', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',  'price' => 10000],
            ],
            weight: 350
        );

        // COD + Delivery only (no Pickup)
        $this->createBarang($dewi, $catBuku,
            'Paket Buku Akuntansi Semester 1-4',
            'Dijual paket lengkap buku akuntansi untuk semester 1 sampai 4. Total 8 buku. Kondisi baik semua, tidak ada coretan.',
            320000, 600000, 'bekas', true, 1,
            ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 15000],
            ],
            weight: 3000
        );

        // COD + Delivery only (no Pickup)
        $this->createBarang($budi, $catElektronik,
            'Laptop Asus VivoBook 14 Intel Core i5',
            'Laptop Asus VivoBook 14 Core i5-1135G7, RAM 8GB, SSD 512GB. Kondisi mulus. Baterai tahan 5-6 jam. Dijual karena upgrade.',
            4500000, 7000000, 'bekas', true, 1,
            [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
            ],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ],
            weight: 1500
        );

        // All 3 methods — bekas, multi-image
        $this->createBarang($budi, $catElektronik,
            'Headphone Sony WH-1000XM4',
            'Headphone Sony WH-1000XM4 noise cancelling. Kondisi 95% mulus. Suara jernih, baterai masih kuat. Lengkap dengan case dan kabel.',
            1800000, 3500000, 'bekas', true, 1,
            [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
            ],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 10000],
            ],
            weight: 250
        );

        // COD + Pickup only
        $this->createBarang($reza, $catElektronik,
            'Kamera Mirrorless Sony Alpha A6000',
            'Kamera Sony A6000 body only kondisi mulus. Shutter count masih rendah sekitar 8000. Cocok untuk photography pemula.',
            2800000, 5000000, 'bekas', true, 1,
            ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'],
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ],
            weight: 350
        );

        // BARU condition — All 3 methods, kendaraan category
        $this->createBarang($reza, $catKendaraan,
            'Helm LS2 FF800 Full Face',
            'Helm LS2 FF800 full face warna hitam doff. Kondisi baru masih segel, belum pernah dipakai. Ukuran M (57-58cm). DOT & ECE certified.',
            850000, 1200000, 'baru', false, 3,
            ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'],
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 15000],
            ],
            weight: 1500
        );

        // SOLD OUT — COD + Pickup, stock=0
        $this->createBarang($budi, $catKendaraan,
            'Sepeda Mini Polygun Bekas',
            'Sepeda mini polygun warna merah. Cocok untuk anak kos yang mau belajar sepeda atau sekadar piknik di sekitar kampus.',
            250000, 400000, 'bekas', true, 0,
            ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400'],
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ],
            weight: 10000,
            forceStatus: 'sold_out'
        );

        // Legacy
        $this->createBarang($seller, $catElektronik,
            'Laptop Gaming ROG Strix G15',
            'Laptop gaming bekas 1 tahun pemakaian, kondisi seperti baru. RTX 3060, RAM 16GB. Cocok untuk gaming dan editing video.',
            12000000, 15000000, 'bekas', true, 1,
            ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
            [
                ['type' => 'cod',      'label' => 'COD',           'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',  'price' => 5000, 'price_max' => 10000],
            ],
            weight: 2500
        );

        // ─── JASA ──────────────────────────────────────────────────────────────
        //
        // CHECKOUT TEST MATRIX — JASA (Metode Layanan):
        // +----------------------------------+--------+--------+--------------+
        // | Product                          | Online | Onsite | Home Service |
        // +----------------------------------+--------+--------+--------------+
        // | Les Privat Matematika & Fisika   |   Y    |   Y    |     Y        | <- All 3
        // | Jasa Desain Logo & Poster       |   Y    |   Y    |     N        | <- Online + Onsite
        // | Jasa Foto Wisuda & Portrait     |   N    |   Y    |     Y        | <- Onsite + Home
        // | Tutor Bahasa Inggris & TOEFL    |   Y    |   N    |     Y        | <- Online + Home
        // | Servis Laptop & PC Install      |   N    |   Y    |     Y        | <- Onsite + Home
        // | Jasa Edit Video & Reels         |   Y    |   N    |     N        | <- Online only
        // | Jasa Fotografi Event Kampus     |   N    |   Y    |     Y        | <- Onsite + Home
        // | Jasa Desain Social Media        |   Y    |   Y    |     N        | <- Online + Onsite
        // | Jasa Pembuatan Website          |   Y    |   N    |     Y        | <- Online + Home
        // | Jasa Print Skripsi              |   N    |   Y    |     N        | <- Onsite only
        // | Jasa Makeup Wisuda (BUSY)       |   N    |   Y    |     Y        | <- Onsite + Home, busy
        // +----------------------------------+--------+--------+--------------+

        // All 3 methods
        $this->createJasa($ahmad, $catLes,
            'Les Privat Matematika & Fisika',
            'Les privat matematika dan fisika untuk SMA dan mahasiswa tingkat 1-2. Materi disesuaikan kebutuhan. Sabar dan mudah dipahami.',
            50000, 50000, 80000, 'range', 1, 2, 'jam', true,
            ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'],
            [
                ['type' => 'online',       'label' => 'Online via Zoom/Meet',  'price' => 0],
                ['type' => 'onsite',       'label' => 'Onsite - Di Kampus',    'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',          'price' => 15000],
            ]
        );

        // Online + Onsite
        $this->createJasa($budi, $catDesain,
            'Jasa Desain Logo & Poster',
            'Jasa desain logo profesional, poster, banner, dan brand identity. Menggunakan Figma dan Adobe Illustrator. Revisi sampai puas.',
            75000, 75000, 350000, 'range', 1, 3, 'hari', true,
            ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400'],
            [
                ['type' => 'online', 'label' => 'Online - Kirim File',     'price' => 0],
                ['type' => 'onsite', 'label' => 'Onsite - Diskusi Kampus', 'price' => 0],
            ]
        );

        // Onsite + Home Service
        $this->createJasa($reza, $catFoto,
            'Jasa Foto Wisuda & Portrait',
            'Jasa fotografi wisuda dan portrait profesional. Pengalaman 3 tahun. Hasil edit natural dan elegan. Include 20 foto edit.',
            150000, 150000, 500000, 'range', 2, 4, 'jam', true,
            ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400'],
            [
                ['type' => 'onsite',       'label' => 'Onsite - Lokasi Kampus', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',           'price' => 50000],
            ]
        );

        // Online + Home Service
        $this->createJasa($reza, $catLes,
            'Tutor Bahasa Inggris & TOEFL Preparation',
            'Tutor bahasa Inggris dengan fokus conversational dan persiapan TOEFL. Berpengalaman mengajar 4 tahun. Score TOEFL 580+.',
            60000, 60000, 100000, 'range', 1, 2, 'jam', true,
            ['https://images.unsplash.com/photo-1427504494785-cdfa6b007da0?w=400'],
            [
                ['type' => 'online',       'label' => 'Online via Zoom/Meet', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',         'price' => 20000],
            ]
        );

        // Onsite + Home Service
        $this->createJasa($dewi, $catTeknisi,
            'Servis Laptop & PC Install Ulang',
            'Terima servis laptop dan PC semua merk. Ganti thermal paste, bersihkan fan, install ulang Windows/Linux. Garansi 1 bulan.',
            50000, 50000, 250000, 'range', 1, 3, 'hari', false,
            ['https://images.unsplash.com/photo-1588872657578-7efd81e90960?w=400'],
            [
                ['type' => 'onsite',       'label' => 'Onsite - Antar ke Tempat', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',             'price' => 20000],
            ]
        );

        // Online only
        $this->createJasa($siti, $catDesain,
            'Jasa Edit Video & Reels Instagram',
            'Jasa edit video untuk konten sosial media, YouTube, dokumentasi acara. Hasil cinematic dan profesional. Revisi 2x.',
            100000, 100000, 500000, 'range', 1, 5, 'hari', true,
            ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400'],
            [
                ['type' => 'online', 'label' => 'Online - Kirim File', 'price' => 0],
            ]
        );

        // Onsite + Home Service
        $this->createJasa($budi, $catFoto,
            'Jasa Fotografi Event & Gathering Kampus',
            'Jasa fotografi untuk event, gathering, acara kampus. Paket mulai dari foto candid hingga full editing. Include 50+ foto.',
            120000, 120000, 600000, 'range', 3, 8, 'jam', true,
            ['https://images.unsplash.com/photo-1505045612881-8c8e548158f1?w=400'],
            [
                ['type' => 'onsite',       'label' => 'Onsite - Lokasi Event', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',          'price' => 30000],
            ]
        );

        // Online + Onsite
        $this->createJasa($ahmad, $catDesain,
            'Jasa Desain Social Media & Content Creator',
            'Membuat desain carousel, template, dan konten visual untuk Instagram, TikTok, dan media sosial lainnya. Paket bulanan tersedia.',
            80000, 80000, 400000, 'range', 1, 2, 'hari', true,
            ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'],
            [
                ['type' => 'online', 'label' => 'Online - Kirim File',     'price' => 0],
                ['type' => 'onsite', 'label' => 'Onsite - Diskusi Kampus', 'price' => 0],
            ]
        );

        // Online + Home Service
        $this->createJasa($dewi, $catTeknisi,
            'Jasa Pembuatan Website & Toko Online',
            'Membuat website profesional, landing page, atau toko online dengan teknologi terkini (Laravel, Next.js). Konsultasi gratis.',
            200000, 200000, 1000000, 'range', 5, 14, 'hari', true,
            ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400'],
            [
                ['type' => 'online',       'label' => 'Online - Remote',  'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',     'price' => 50000],
            ]
        );

        // Onsite only
        $this->createJasa($siti, $catTeknisi,
            'Jasa Print Warna & Binding Skripsi',
            'Jasa print warna dan hitam putih, binding skripsi soft cover dan hard cover. Tersedia juga jilid spiral. Hasil rapi dan cepat.',
            5000, 5000, 50000, 'range', 1, 1, 'hari', false,
            ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400'],
            [
                ['type' => 'onsite', 'label' => 'Onsite - Ambil di Tempat', 'price' => 0],
            ]
        );

        // Kecantikan category — Onsite + Home Service — availability_status = busy
        $this->createJasa($siti, $catKecantikan,
            'Jasa Makeup Wisuda & Prewedding',
            'Jasa makeup profesional untuk wisuda, prewedding, dan acara formal. Pengalaman 5 tahun. Paket include hair do dan makeup.',
            200000, 200000, 750000, 'range', 2, 4, 'jam', true,
            ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400'],
            [
                ['type' => 'onsite',       'label' => 'Onsite - Datang ke Studio', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',              'price' => 75000],
            ],
            availabilityStatus: 'busy'
        );

        // Legacy
        $this->createJasa($seller, $catLes,
            'Les Privat Matematika Dasar',
            'Les privat Matematika untuk SMA level expert. Berpengalaman mengajar 5 tahun. Garansi nilai naik.',
            10000, null, null, 'fixed', 1, 2, 'jam', true,
            ['https://images.unsplash.com/photo-1427504494785-cdfa6b007da0?w=500'],
            [
                ['type' => 'online',       'label' => 'Online',       'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service', 'price' => 2000],
            ]
        );

        // ─── CONSOLE OUTPUT ────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('==========================================');
        $this->command->info('  DATABASE SEEDER COMPLETED');
        $this->command->info('==========================================');
        $this->command->info('');
        $this->command->info('State: Fresh marketplace (0 rating, 0 sold, 0 notifications)');
        $this->command->info('');
        $this->command->info('Available Accounts:');
        $this->command->info('  admin@kampusmarket.com  / admin123     (Admin)');
        $this->command->info('  ahmad@student.ub.ac.id  / password123  (Seller - FILKOM)');
        $this->command->info('  siti@student.ub.ac.id   / password123  (Seller - FEB)');
        $this->command->info('  budi@student.ub.ac.id   / password123  (Seller - FT)');
        $this->command->info('  dewi@student.ub.ac.id   / password123  (Seller - FMIPA)');
        $this->command->info('  reza@student.ub.ac.id   / password123  (Seller - FISIP)');
        $this->command->info('  seller@example.com      / password123  (Seller Legacy - FILKOM)');
        $this->command->info('  buyer@student.ub.ac.id  / password123  (Buyer - FILKOM)');
        $this->command->info('');
        $this->command->info('Catalog:');
        $this->command->info('  13 Barang (11 active + 1 baru + 1 sold_out)');
        $this->command->info('  12 Jasa   (10 available + 1 busy + 1 legacy)');
        $this->command->info('  2  Addresses seeded (buyer + ahmad)');
        $this->command->info('');
        $this->command->info('Categories with products:');
        $this->command->info('  Barang: elektronik, buku, fashion, furniture, olahraga, kendaraan');
        $this->command->info('  Jasa:   pendidikan-les, desain-kreatif, fotografi-video, teknisi-servis, kecantikan');
        $this->command->info('');
        $this->command->info('------------------------------------------');
        $this->command->info('  CHECKOUT VALIDATION TEST SCENARIOS');
        $this->command->info('------------------------------------------');
        $this->command->info('');
        $this->command->info('[BARANG - Shipping Method Intersection]');
        $this->command->info('  FAIL: Jaket UB (COD+Pickup) + Meja Kayu (Pickup+Delivery) + Buku Akuntansi (COD+Delivery)');
        $this->command->info('        -> No common method');
        $this->command->info('');
        $this->command->info('  PASS: Kalkulator Casio (All) + Jaket UB (COD+Pickup) + Meja Kayu (Pickup+Delivery)');
        $this->command->info('        -> Pickup is common');
        $this->command->info('');
        $this->command->info('  PASS: Jaket UB (COD+Pickup) + Mouse Logitech (COD+Pickup)');
        $this->command->info('        -> COD & Pickup are common');
        $this->command->info('');
        $this->command->info('[JASA - Service Method Intersection]');
        $this->command->info('  FAIL: Desain Logo (Online+Onsite) + Foto Wisuda (Onsite+Home) + Tutor TOEFL (Online+Home)');
        $this->command->info('        -> No common method');
        $this->command->info('');
        $this->command->info('  PASS: Les Matematika (All) + Desain Logo (Online+Onsite) + Foto Wisuda (Onsite+Home)');
        $this->command->info('        -> Onsite is common');
        $this->command->info('');
        $this->command->info('  FAIL: Edit Video (Online) + Print Skripsi (Onsite)');
        $this->command->info('        -> No common method');
        $this->command->info('');
        $this->command->info('[GENERAL RULES]');
        $this->command->info('  FAIL: Any Barang + Any Jasa');
        $this->command->info('        -> Cross-type checkout not allowed');
        $this->command->info('');
        $this->command->info('  FAIL: Any 4+ items combination');
        $this->command->info('        -> Max 3 items per checkout');
        $this->command->info('');
        $this->command->info('[UI STATE TESTING]');
        $this->command->info('  Helm LS2      -> condition=baru (test filter Baru)');
        $this->command->info('  Sepeda Mini   -> stock=0, status=sold_out (test UI stok habis)');
        $this->command->info('  Makeup Wisuda -> availability_status=busy (test UI sibuk)');
        $this->command->info('  Buyer         -> has 2 addresses (test delivery checkout)');
        $this->command->info('');
        $this->command->info('==========================================');
        $this->command->info('');
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private function firstOrCreateUser(string $email, array $attrs): User
    {
        return User::where('email', $email)->first()
            ?? User::create(array_merge([
                'uuid'              => NumberGenerator::uuid(),
                'email'             => $email,
                'password'          => Hash::make('password123'),
                'location'          => 'Malang',
                'is_verified'       => true,
                'email_verified_at' => now(),
            ], $attrs));
    }

    private function seedAddresses(User $user): void
    {
        if (\App\Models\Address::where('user_id', $user->id)->count() > 0) {
            return;
        }

        \App\Models\Address::create([
            'uuid'       => NumberGenerator::uuid(),
            'user_id'    => $user->id,
            'label'      => 'Kost',
            'recipient'  => $user->name,
            'phone'      => $user->phone,
            'address'    => 'Jl. Soekarno-Hatta No. 9, Kost Putri Melati 2A, Lowokwaru',
            'notes'      => 'Pintu hijau, lantai 2',
            'is_primary' => true,
        ]);

        \App\Models\Address::create([
            'uuid'       => NumberGenerator::uuid(),
            'user_id'    => $user->id,
            'label'      => 'Rumah',
            'recipient'  => $user->name,
            'phone'      => $user->phone,
            'address'    => 'Jl. Ijen No. 15, Kelurahan Klojen, Kecamatan Klojen',
            'notes'      => null,
            'is_primary' => false,
        ]);
    }

    private function createBarang(
        User $seller,
        ?Category $category,
        string $title,
        string $description,
        int $price,
        ?int $originalPrice,
        string $condition,
        bool $canNego,
        int $stock,
        string|array $imageUrls,
        array $shipping,
        ?int $weight = null,
        ?string $forceStatus = null,
    ): void {
        if (!$category) return;

        $slug = NumberGenerator::uniqueSlug($title, Product::class);
        if (Product::where('slug', $slug)->exists()) return;

        $status = $forceStatus ?? 'active';
        if ($condition === 'barang' && $stock === 0 && $status === 'active') {
            $status = 'sold_out';
        }

        $product = Product::create([
            'uuid'           => NumberGenerator::uuid(),
            'seller_id'      => $seller->id,
            'category_id'    => $category->id,
            'title'          => $title,
            'slug'           => $slug,
            'description'    => $description,
            'price'          => $price,
            'original_price' => $originalPrice,
            'price_type'     => 'fixed',
            'type'           => 'barang',
            'condition'      => $condition,
            'stock'          => $stock,
            'weight'         => $weight,
            'can_nego'       => $canNego,
            'location'       => $seller->location ?? 'Malang',
            'rating'         => 0,
            'review_count'   => 0,
            'sold_count'     => 0,
            'status'         => $status,
        ]);

        $images = is_array($imageUrls) ? $imageUrls : [$imageUrls];
        foreach ($images as $index => $url) {
            ProductImage::create([
                'product_id' => $product->id,
                'url'        => $url,
                'alt'        => $title,
                'sort_order' => $index,
                'is_primary' => $index === 0,
            ]);
        }

        foreach ($shipping as $opt) {
            ShippingOption::create([
                'uuid'       => NumberGenerator::uuid(),
                'product_id' => $product->id,
                'type'       => $opt['type'],
                'label'      => $opt['label'],
                'price'      => $opt['price'],
                'price_max'  => $opt['price_max'] ?? null,
            ]);
        }
    }

    private function createJasa(
        User $seller,
        ?Category $category,
        string $title,
        string $description,
        int $price,
        ?int $priceMin,
        ?int $priceMax,
        string $priceType,
        int $durationMin,
        int $durationMax,
        string $durationUnit,
        bool $canNego,
        string|array $imageUrls,
        array $shipping,
        string $availabilityStatus = 'available',
    ): void {
        if (!$category) return;

        $slug = NumberGenerator::uniqueSlug($title, Product::class);
        if (Product::where('slug', $slug)->exists()) return;

        $product = Product::create([
            'uuid'                => NumberGenerator::uuid(),
            'seller_id'           => $seller->id,
            'category_id'         => $category->id,
            'title'               => $title,
            'slug'                => $slug,
            'description'         => $description,
            'price'               => $price,
            'price_min'           => $priceMin,
            'price_max'           => $priceMax,
            'price_type'          => $priceType,
            'type'                => 'jasa',
            'condition'           => null,
            'stock'               => 99,
            'duration_min'        => $durationMin,
            'duration_max'        => $durationMax,
            'duration_unit'       => $durationUnit,
            'can_nego'            => $canNego,
            'location'            => $seller->location ?? 'Malang',
            'rating'              => 0,
            'review_count'        => 0,
            'sold_count'          => 0,
            'availability_status' => $availabilityStatus,
            'status'              => 'active',
        ]);

        $images = is_array($imageUrls) ? $imageUrls : [$imageUrls];
        foreach ($images as $index => $url) {
            ProductImage::create([
                'product_id' => $product->id,
                'url'        => $url,
                'alt'        => $title,
                'sort_order' => $index,
                'is_primary' => $index === 0,
            ]);
        }

        foreach ($shipping as $opt) {
            ShippingOption::create([
                'uuid'       => NumberGenerator::uuid(),
                'product_id' => $product->id,
                'type'       => $opt['type'],
                'label'      => $opt['label'],
                'price'      => $opt['price'],
                'price_max'  => $opt['price_max'] ?? null,
            ]);
        }
    }
}
