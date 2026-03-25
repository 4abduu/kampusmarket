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
        Schema::create('shipping_options', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();

            $table->enum('type', ['gratis', 'pickup', 'delivery'])->default('pickup');
            $table->string('label'); // 'Ketemuan Kampus', 'Antar ke Alamat', etc.
            $table->unsignedBigInteger('price')->default(0); // dalam cent
            $table->unsignedBigInteger('price_max')->nullable(); // untuk range harga

            $table->timestamps();

            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_options');
    }
};
