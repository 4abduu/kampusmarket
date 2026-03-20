<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->unsignedBigInteger('seller_id')->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('title');
            $table->string('slug')->index();
            $table->text('description');
            $table->unsignedBigInteger('price')->default(0);
            $table->unsignedBigInteger('original_price')->nullable();
            $table->unsignedBigInteger('price_min')->nullable();
            $table->unsignedBigInteger('price_max')->nullable();
            $table->enum('price_type', ['fixed', 'range', 'starting'])->default('fixed');
            $table->enum('type', ['barang', 'jasa'])->default('barang');
            $table->enum('condition', ['baru', 'bekas'])->nullable();
            $table->integer('stock')->default(1);
            $table->unsignedInteger('weight')->nullable();
            $table->unsignedInteger('duration_min')->nullable();
            $table->unsignedInteger('duration_max')->nullable();
            $table->enum('duration_unit', ['jam', 'hari', 'minggu', 'bulan'])->nullable();
            $table->boolean('duration_is_plus')->default(false);
            $table->enum('availability_status', ['available', 'busy', 'full'])->nullable();
            $table->boolean('is_online')->default(false);
            $table->boolean('is_onsite')->default(false);
            $table->boolean('is_home_service')->default(false);
            $table->boolean('can_nego')->default(true);
            $table->boolean('is_cod')->default(false);
            $table->boolean('is_pickup')->default(true);
            $table->boolean('is_delivery')->default(false);
            $table->unsignedBigInteger('delivery_fee_min')->nullable();
            $table->unsignedBigInteger('delivery_fee_max')->nullable();
            $table->string('location');
            $table->unsignedInteger('views')->default(0);
            $table->decimal('rating', 3)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('sold_count')->default(0);
            $table->enum('status', ['draft', 'active', 'sold_out', 'archived'])->default('active')->index();
            $table->timestamp('created_at')->nullable()->index();
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();

            $table->unique(['slug']);
            $table->index(['type', 'status']);
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
