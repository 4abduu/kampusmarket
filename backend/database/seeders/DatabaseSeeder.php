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
        // Create faculty - using code-based instead of UUID since migration doesn't have UUID for faculties
        $faculty = Faculty::where('code', 'filkom')->first();
        if (!$faculty) {
            $faculty = Faculty::create([
                'code' => 'filkom',
                'name' => 'Fakultas Ilmu Komputer',
                'sort_order' => 3,
                'is_active' => true,
            ]);
        }

        // Create test users
        $seller = User::factory()->create([
            'uuid' => NumberGenerator::uuid(),
            'name' => 'Penjual Test',
            'email' => 'seller@example.com',
            'password' => Hash::make('password123'),
            'faculty_id' => $faculty->id,
        ]);

        $buyer = User::factory()->create([
            'uuid' => NumberGenerator::uuid(),
            'name' => 'Pembeli Test',
            'email' => 'buyer@example.com',
            'password' => Hash::make('password123'),
            'faculty_id' => $faculty->id,
        ]);

        // Create categories
        $categoryBarang = Category::firstOrCreate(
            ['slug' => 'elektronik'],
            [
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Elektronik',
                'type' => 'barang',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $categoryJasa = Category::firstOrCreate(
            ['slug' => 'les-privat'],
            [
                'uuid' => NumberGenerator::uuid(),
                'name' => 'Les Privat',
                'type' => 'jasa',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        // Create sample products (BARANG)
        $productBarang = Product::create([
            'uuid' => NumberGenerator::uuid(),
            'seller_id' => $seller->id,
            'category_id' => $categoryBarang->id,
            'title' => 'Laptop Gaming ROG',
            'slug' => NumberGenerator::uniqueSlug('Laptop Gaming ROG', Product::class),
            'description' => 'Laptop gaming bekas 1 tahun pemakaian, kondisi seperti baru. Cocok untuk gaming dan editing video.',
            'price' => 1200000000, // 12 juta Rupiah (in cent)
            'original_price' => 1500000000, // 15 juta
            'price_type' => 'fixed',
            'type' => 'barang',
            'condition' => 'bekas',
            'stock' => 5,
            'weight' => 2500,
            'can_nego' => true,
            'location' => 'Kampus Limau Manis, Padang',
            'status' => 'active',
        ]);

        // Add images
        ProductImage::create([
            'product_id' => $productBarang->id,
            'url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        // Add shipping options for barang
        ShippingOption::create([
            'uuid' => NumberGenerator::uuid(),
            'product_id' => $productBarang->id,
            'type' => 'cod',
            'label' => 'COD',
            'price' => 0,
        ]);

        ShippingOption::create([
            'uuid' => NumberGenerator::uuid(),
            'product_id' => $productBarang->id,
            'type' => 'pickup',
            'label' => 'Ambil Sendiri',
            'price' => 0,
        ]);

        ShippingOption::create([
            'uuid' => NumberGenerator::uuid(),
            'product_id' => $productBarang->id,
            'type' => 'delivery',
            'label' => 'Antar Manual',
            'price' => 500000, // 50rb (in cent)
            'price_max' => 1000000, // 100rb max
        ]);

        // Create sample products (JASA)
        $productJasa = Product::create([
            'uuid' => NumberGenerator::uuid(),
            'seller_id' => $seller->id,
            'category_id' => $categoryJasa->id,
            'title' => 'Les Privat Matematika',
            'slug' => NumberGenerator::uniqueSlug('Les Privat Matematika', Product::class),
            'description' => 'Les privat Matematika untuk SMA level expert. Berpengalaman mengajar 5 tahun.',
            'price' => 1000000, // 100rb per sesi (in cent)
            'price_type' => 'fixed',
            'type' => 'jasa',
            'duration_min' => 1,
            'duration_max' => 2,
            'duration_unit' => 'jam',
            'availability_status' => 'available',
            'can_nego' => true,
            'location' => 'Kampus Limau Manis, Padang',
            'status' => 'active',
        ]);

        // Add images for jasa
        ProductImage::create([
            'product_id' => $productJasa->id,
            'url' => 'https://images.unsplash.com/photo-1427504494785-cdfa6b007da0?w=500',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        // Add service modes
        ShippingOption::create([
            'uuid' => NumberGenerator::uuid(),
            'product_id' => $productJasa->id,
            'type' => 'online',
            'label' => 'Online',
            'price' => 0,
        ]);

        ShippingOption::create([
            'uuid' => NumberGenerator::uuid(),
            'product_id' => $productJasa->id,
            'type' => 'home_service',
            'label' => 'Home Service',
            'price' => 200000, // 20rb extra (in cent)
        ]);
    }
}
