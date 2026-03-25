<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();

            // ENUM untuk type (3NF)
            $table->enum('type', ['barang', 'jasa'])->default('barang');

            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index('slug');
        });

        // Seed initial categories for Barang
        $barangCategories = [
            ['name' => 'Elektronik', 'slug' => 'elektronik', 'sort_order' => 1],
            ['name' => 'Buku', 'slug' => 'buku', 'sort_order' => 2],
            ['name' => 'Fashion', 'slug' => 'fashion', 'sort_order' => 3],
            ['name' => 'Furniture', 'slug' => 'furniture', 'sort_order' => 4],
            ['name' => 'Olahraga', 'slug' => 'olahraga', 'sort_order' => 5],
            ['name' => 'Kendaraan', 'slug' => 'kendaraan', 'sort_order' => 6],
            ['name' => 'Lainnya', 'slug' => 'lainnya-barang', 'sort_order' => 7],
        ];

        foreach ($barangCategories as $cat) {
            DB::table('categories')->insert([
                'uuid' => (string) Str::uuid(),
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'type' => 'barang',
                'sort_order' => $cat['sort_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed initial categories for Jasa
        $jasaCategories = [
            ['name' => 'Fotografi & Video', 'slug' => 'fotografi-video', 'sort_order' => 1],
            ['name' => 'Pendidikan & Les', 'slug' => 'pendidikan-les', 'sort_order' => 2],
            ['name' => 'Desain & Kreatif', 'slug' => 'desain-kreatif', 'sort_order' => 3],
            ['name' => 'Teknisi & Servis', 'slug' => 'teknisi-servis', 'sort_order' => 4],
            ['name' => 'Kecantikan', 'slug' => 'kecantikan', 'sort_order' => 5],
            ['name' => 'Lainnya', 'slug' => 'lainnya-jasa', 'sort_order' => 6],
        ];

        foreach ($jasaCategories as $cat) {
            DB::table('categories')->insert([
                'uuid' => (string) Str::uuid(),
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'type' => 'jasa',
                'sort_order' => $cat['sort_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
