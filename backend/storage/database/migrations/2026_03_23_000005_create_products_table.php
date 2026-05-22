<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Perubahan dari Prisma:
     * - images: JSON String → DIHAPUS (pindah ke tabel product_images untuk 1NF)
     * - Semua status/type menggunakan ENUM (3NF)
     * - Harga menggunakan BIGINT (untuk MySQL)
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Relations
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();

            // Info
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');

            // Pricing (BIGINT untuk cent - Rupiah * 100)
            $table->unsignedBigInteger('price')->default(0);
            $table->unsignedBigInteger('original_price')->nullable();
            $table->unsignedBigInteger('price_min')->nullable();
            $table->unsignedBigInteger('price_max')->nullable();
            $table->enum('price_type', ['fixed', 'range', 'starting'])->default('fixed');

            // Product Type
            $table->enum('type', ['barang', 'jasa'])->default('barang');

            // Barang specific
            $table->enum('condition', ['baru', 'bekas'])->nullable();
            $table->integer('stock')->default(1);
            $table->unsignedInteger('weight')->nullable(); // gram

            // Jasa specific
            $table->unsignedInteger('duration_min')->nullable();
            $table->unsignedInteger('duration_max')->nullable();
            $table->enum('duration_unit', ['jam', 'hari', 'minggu', 'bulan'])->nullable();
            $table->boolean('duration_is_plus')->default(false);
            $table->enum('availability_status', ['available', 'busy', 'full'])->nullable();

            // Negotiation
            $table->boolean('can_nego')->default(true);

            // Opsi pengiriman/pelayanan disimpan di tabel shipping_options

            $table->string('location');

            // Stats
            $table->unsignedInteger('views')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('sold_count')->default(0);

            // Status
            $table->enum('status', ['draft', 'active', 'sold_out', 'archived'])->default('active');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('seller_id');
            $table->index('category_id');
            $table->index('slug');
            $table->index('status');
            $table->index(['type', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
