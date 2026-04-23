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
     */
    public function run(): void
    {
        // ─── 1. FACULTY ────────────────────────────────────────────────────────
        $faculty = Faculty::where('code', 'filkom')->first();
        if (!$faculty) {
            $faculty = Faculty::create([
                'code' => 'filkom',
                'name' => 'Fakultas Ilmu Komputer',
                'sort_order' => 3,
                'is_active' => true,
            ]);
        }

        // ─── 2. USERS (SELLERS) ────────────────────────────────────────────────
        $ahmad = User::where('email', 'ahmad@student.ub.ac.id')->first();
        if (!$ahmad) {
            $ahmad = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Ahmad Rifa\'i',
                'email' => 'ahmad@student.ub.ac.id',
                'password' => Hash::make('password123'),
                'phone' => '082234567890',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        $siti = User::where('email', 'siti@student.ub.ac.id')->first();
        if (!$siti) {
            $siti = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@student.ub.ac.id',
                'password' => Hash::make('password123'),
                'phone' => '082245678901',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        $budi = User::where('email', 'budi@student.ub.ac.id')->first();
        if (!$budi) {
            $budi = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Budi Hartono',
                'email' => 'budi@student.ub.ac.id',
                'password' => Hash::make('password123'),
                'phone' => '082256789012',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        $dewi = User::where('email', 'dewi@student.ub.ac.id')->first();
        if (!$dewi) {
            $dewi = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Dewi Lestari',
                'email' => 'dewi@student.ub.ac.id',
                'password' => Hash::make('password123'),
                'phone' => '082267890123',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        $reza = User::where('email', 'reza@student.ub.ac.id')->first();
        if (!$reza) {
            $reza = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Reza Prawira',
                'email' => 'reza@student.ub.ac.id',
                'password' => Hash::make('password123'),
                'phone' => '082278901234',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Legacy seller & buyer
        $seller = User::where('email', 'seller@example.com')->first();
        if (!$seller) {
            $seller = User::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Penjual Test',
                'email' => 'seller@example.com',
                'password' => Hash::make('password123'),
                'phone' => '082289012345',
                'faculty_id' => $faculty->id,
                'location' => 'Malang',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);
        }

        // ─── 3. CATEGORIES ─────────────────────────────────────────────────────
        // BARANG CATEGORIES
        $catElektronik = Category::firstOrCreate(
            ['slug' => 'elektronik'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Elektronik', 'type' => 'barang', 'sort_order' => 1, 'is_active' => true]
        );
        $catBuku = Category::firstOrCreate(
            ['slug' => 'buku'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Buku', 'type' => 'barang', 'sort_order' => 2, 'is_active' => true]
        );
        $catFashion = Category::firstOrCreate(
            ['slug' => 'fashion'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Fashion', 'type' => 'barang', 'sort_order' => 3, 'is_active' => true]
        );
        $catFurniture = Category::firstOrCreate(
            ['slug' => 'furniture'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Furniture', 'type' => 'barang', 'sort_order' => 4, 'is_active' => true]
        );
        $catOlahraga = Category::firstOrCreate(
            ['slug' => 'olahraga'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Olahraga', 'type' => 'barang', 'sort_order' => 5, 'is_active' => true]
        );

        // JASA CATEGORIES
        $catFoto = Category::firstOrCreate(
            ['slug' => 'fotografi-video'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Fotografi & Video', 'type' => 'jasa', 'sort_order' => 1, 'is_active' => true]
        );
        $catLes = Category::firstOrCreate(
            ['slug' => 'pendidikan-les'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Pendidikan & Les', 'type' => 'jasa', 'sort_order' => 2, 'is_active' => true]
        );
        $catDesain = Category::firstOrCreate(
            ['slug' => 'desain-kreatif'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Desain & Kreatif', 'type' => 'jasa', 'sort_order' => 3, 'is_active' => true]
        );
        $catTeknisi = Category::firstOrCreate(
            ['slug' => 'teknisi-servis'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Teknisi & Servis', 'type' => 'jasa', 'sort_order' => 4, 'is_active' => true]
        );
        $catLesPribadi = Category::firstOrCreate(
            ['slug' => 'les-privat'],
            ['uuid' => NumberGenerator::uuid(), 'name' => 'Les Privat', 'type' => 'jasa', 'sort_order' => 10, 'is_active' => true]
        );

        // ─── 4. PRODUCTS (BARANG) ──────────────────────────────────────────────
        $this->createBarang($siti, $catElektronik,
            'Kalkulator Scientific Casio FX-991EX',
            'Kalkulator scientific Casio FX-991EX kondisi sangat bagus. Masih ada dus dan buku manual. Cocok untuk mahasiswa teknik dan sains.',
            18000000, 25000000, 'bekas', true, 4.8, 7, 7,
            'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ]
        );

        $this->createBarang($budi, $catElektronik,
            'Laptop Asus VivoBook 14 Intel Core i5',
            'Laptop Asus VivoBook 14 Core i5-1135G7, RAM 8GB, SSD 512GB. Kondisi mulus. Baterai tahan 5-6 jam. Dijual karena upgrade.',
            450000000, 700000000, 'bekas', true, 4.9, 3, 3,
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        $this->createBarang($dewi, $catBuku,
            'Buku Kalkulus Purcell Edisi 9',
            'Buku Kalkulus Purcell edisi 9 jilid 1 dan 2. Kondisi baik, ada beberapa stabilo. Lengkap dengan soal-soal latihan.',
            8500000, 15000000, 'bekas', true, 4.6, 11, 11,
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ]
        );

        $this->createBarang($ahmad, $catFurniture,
            'Meja Belajar Portable Lipat Kayu',
            'Meja belajar portable lipat dari kayu. Ringan dan mudah dibawa. Cocok untuk belajar di kos. Ukuran 60x40cm.',
            12000000, null, 'bekas', false, 4.5, 4, 4,
            'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ]
        );

        $this->createBarang($siti, $catFashion,
            'Jaket Almamater Universitas Brawijaya',
            'Jaket almamater UB ukuran L. Kondisi sangat bagus, hanya dipakai beberapa kali untuk acara resmi.',
            15000000, 25000000, 'bekas', true, 4.9, 18, 18,
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        $this->createBarang($budi, $catElektronik,
            'Headphone Sony WH-1000XM4',
            'Headphone Sony WH-1000XM4 noise cancelling. Kondisi 95% mulus. Suara jernih, baterai masih kuat. Lengkap dengan case dan kabel.',
            180000000, 350000000, 'bekas', true, 4.7, 6, 6,
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        $this->createBarang($dewi, $catBuku,
            'Paket Buku Akuntansi Semester 1-4',
            'Dijual paket lengkap buku akuntansi untuk semester 1 sampai 4. Total 8 buku. Kondisi baik semua.',
            32000000, 60000000, 'bekas', true, 4.4, 9, 9,
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ]
        );

        $this->createBarang($reza, $catElektronik,
            'Kamera Mirrorless Sony Alpha A6000',
            'Kamera Sony A6000 body only kondisi mulus. Shutter count masih rendah sekitar 8000. Cocok untuk photography pemula.',
            280000000, 500000000, 'bekas', true, 4.8, 5, 5,
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        $this->createBarang($ahmad, $catOlahraga,
            'Sepatu Futsal Nike Tiempo Lunar',
            'Sepatu futsal Nike Tiempo Lunar ukuran 42. Kondisi 80%, sol masih bagus.',
            18000000, 40000000, 'bekas', true, 4.3, 4, 4,
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            [
                ['type' => 'cod',    'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup', 'label' => 'Ambil Sendiri',          'price' => 0],
            ]
        );

        $this->createBarang($siti, $catElektronik,
            'Mouse Wireless Logitech MX Master 3',
            'Mouse Logitech MX Master 3 kondisi sangat bagus. Beli baru 6 bulan lalu. Scrolling ultra smooth.',
            55000000, 90000000, 'bekas', false, 4.9, 8, 8,
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
            [
                ['type' => 'cod',      'label' => 'COD - Ketemuan Kampus', 'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri',          'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',           'price' => 0],
            ]
        );

        // Legacy product
        $this->createBarang($seller, $catElektronik,
            'Laptop Gaming ROG',
            'Laptop gaming bekas 1 tahun pemakaian, kondisi seperti baru. Cocok untuk gaming dan editing video.',
            1200000000, 1500000000, 'bekas', true, 0, 0, 0,
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            [
                ['type' => 'cod',      'label' => 'COD',          'price' => 0],
                ['type' => 'pickup',   'label' => 'Ambil Sendiri', 'price' => 0],
                ['type' => 'delivery', 'label' => 'Antar Manual',  'price' => 500000, 'price_max' => 1000000],
            ],
            weight: 2500
        );

        // ─── 5. PRODUCTS (JASA) ────────────────────────────────────────────────
        $this->createJasa($reza, $catFoto,
            'Jasa Foto Wisuda & Portrait',
            'Jasa fotografi wisuda dan portrait profesional. Pengalaman 3 tahun. Hasil edit natural dan elegan.',
            15000000, 15000000, 50000000, 'range', 2, 4, 'jam', true, 4.9, 34, 34,
            'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400',
            [
                ['type' => 'onsite',       'label' => 'Datang ke Lokasi Penyedia',           'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service (Fotografer ke Lokasi)', 'price' => 5000000],
            ]
        );

        $this->createJasa($ahmad, $catLes,
            'Les Privat Matematika & Fisika',
            'Les privat matematika dan fisika untuk SMA dan mahasiswa tingkat 1-2. Sabar dan mudah dipahami.',
            5000000, 5000000, 8000000, 'range', 1, 2, 'jam', true, 4.8, 21, 21,
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
            [
                ['type' => 'online',       'label' => 'Les Online (Video Call)',    'price' => 0],
                ['type' => 'home_service', 'label' => 'Datang ke Rumah',            'price' => 1500000],
                ['type' => 'onsite',       'label' => 'Datang ke Tempat Pengajar', 'price' => 0],
            ]
        );

        $this->createJasa($budi, $catDesain,
            'Jasa Desain Logo & Poster',
            'Jasa desain logo profesional, poster, banner. Menggunakan Figma dan Adobe Illustrator. Revisi sampai puas.',
            7500000, 7500000, 35000000, 'range', 1, 3, 'hari', true, 4.7, 28, 28,
            'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
            [
                ['type' => 'online', 'label' => 'Online / Remote', 'price' => 0],
            ]
        );

        $this->createJasa($dewi, $catTeknisi,
            'Servis Laptop & PC',
            'Terima servis laptop dan PC semua merk. Ganti thermal paste, bersihkan fan, install ulang Windows. Garansi 1 bulan.',
            5000000, 5000000, 25000000, 'range', 1, 3, 'hari', false, 4.6, 42, 42,
            'https://images.unsplash.com/photo-1588872657578-7efd81e90960?w=400',
            [
                ['type' => 'onsite',       'label' => 'Antar ke Tempat Servis', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service',            'price' => 2000000],
            ]
        );

        $this->createJasa($siti, $catDesain,
            'Jasa Edit Video & Reels',
            'Jasa edit video untuk konten sosial media, YouTube, dokumentasi acara. Hasil cinematic dan profesional.',
            10000000, 10000000, 50000000, 'range', 1, 5, 'hari', true, 4.8, 19, 19,
            'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
            [
                ['type' => 'online', 'label' => 'Online / Remote', 'price' => 0],
            ]
        );

        // Additional jasa (6-10)
        $this->createJasa($reza, $catLes,
            'Tutor Bahasa Inggris & TOEFL',
            'Tutor bahasa Inggris dengan fokus conversational dan persiapan TOEFL. Berpengalaman mengajar 4 tahun.',
            6000000, 6000000, 10000000, 'range', 1, 2, 'jam', true, 4.7, 15, 15,
            'https://images.unsplash.com/photo-1427504494785-cdfa6b007da0?w=400',
            [
                ['type' => 'online',       'label' => 'Les Online (Video Call)', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Datang ke Rumah',         'price' => 2000000],
            ]
        );

        $this->createJasa($budi, $catFoto,
            'Jasa Fotografi Event & Gathering',
            'Jasa fotografi untuk event, gathering, acara kampus. Paket mulai dari foto candid hingga full editing.',
            12000000, 12000000, 60000000, 'range', 3, 8, 'jam', true, 4.9, 28, 28,
            'https://images.unsplash.com/photo-1505045612881-8c8e548158f1?w=400',
            [
                ['type' => 'onsite',       'label' => 'Datang ke Lokasi Acara', 'price' => 0],
                ['type' => 'home_service', 'label' => 'Full Paket dengan Editing', 'price' => 3000000],
            ]
        );

        $this->createJasa($ahmad, $catDesain,
            'Jasa Desain Social Media & Content Creator',
            'Membuat desain carousel, template, dan konten visual untuk Instagram, TikTok, dan media sosial lainnya.',
            8000000, 8000000, 40000000, 'range', 1, 2, 'hari', true, 4.8, 22, 22,
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
            [
                ['type' => 'online', 'label' => 'Online / Remote', 'price' => 0],
            ]
        );

        $this->createJasa($dewi, $catTeknisi,
            'Jasa Pembuatan Website & Toko Online',
            'Membuat website profesional, landing page, atau toko online dengan teknologi terkini. Konsultasi gratis.',
            20000000, 20000000, 100000000, 'range', 5, 14, 'hari', true, 4.9, 31, 31,
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
            [
                ['type' => 'online', 'label' => 'Full Remote Development', 'price' => 0],
            ]
        );

        // Legacy jasa
        $this->createJasa($seller, $catLesPribadi,
            'Les Privat Matematika',
            'Les privat Matematika untuk SMA level expert. Berpengalaman mengajar 5 tahun.',
            1000000, null, null, 'fixed', 1, 2, 'jam', true, 0, 0, 0,
            'https://images.unsplash.com/photo-1427504494785-cdfa6b007da0?w=500',
            [
                ['type' => 'online',       'label' => 'Online',       'price' => 0],
                ['type' => 'home_service', 'label' => 'Home Service', 'price' => 200000],
            ]
        );

        $this->command->info('✅  Seeder selesai!');
        $this->command->info('👤 Login yang tersedia:');
        $this->command->info('   ahmad@student.ub.ac.id  / password123');
        $this->command->info('   siti@student.ub.ac.id   / password123');
        $this->command->info('   budi@student.ub.ac.id   / password123');
        $this->command->info('   dewi@student.ub.ac.id   / password123');
        $this->command->info('   reza@student.ub.ac.id   / password123');
        $this->command->info('   seller@example.com      / password123  (legacy)');
        $this->command->info('');
        $this->command->info('📊 Katalog:');
        $this->command->info('   ✓ 10 Produk BARANG');
        $this->command->info('   ✓ 10 Produk JASA');
        $this->command->info('   ✓ 5 Kategori BARANG');
        $this->command->info('   ✓ 5 Kategori JASA');
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private function createBarang(
        User $seller,
        Category $category,
        string $title,
        string $description,
        int $price,
        ?int $originalPrice,
        string $condition,
        bool $canNego,
        float $rating,
        int $reviewCount,
        int $soldCount,
        string $imageUrl,
        array $shipping,
        ?int $weight = null,
    ): void {
        $slug = NumberGenerator::uniqueSlug($title, Product::class);

        // Idempotent: skip jika slug sudah ada
        if (Product::where('slug', $slug)->exists()) {
            return;
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
            'stock'          => 1,
            'weight'         => $weight,
            'can_nego'       => $canNego,
            'location'       => $seller->location ?? 'Malang',
            'rating'         => $rating,
            'review_count'   => $reviewCount,
            'sold_count'     => $soldCount,
            'status'         => 'active',
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'url'        => $imageUrl,
            'alt'        => $title,
            'sort_order' => 0,
            'is_primary' => true,
        ]);

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
        Category $category,
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
        float $rating,
        int $reviewCount,
        int $soldCount,
        string $imageUrl,
        array $shipping,
    ): void {
        $slug = NumberGenerator::uniqueSlug($title, Product::class);

        // Idempotent: skip jika slug sudah ada
        if (Product::where('slug', $slug)->exists()) {
            return;
        }

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
            'rating'              => $rating,
            'review_count'        => $reviewCount,
            'sold_count'          => $soldCount,
            'availability_status' => 'available',
            'status'              => 'active',
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'url'        => $imageUrl,
            'alt'        => $title,
            'sort_order' => 0,
            'is_primary' => true,
        ]);

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
