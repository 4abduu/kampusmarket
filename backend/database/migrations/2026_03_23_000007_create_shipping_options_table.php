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

            $table->enum('type', ['gratis', 'cod', 'pickup', 'delivery', 'online', 'onsite', 'home_service'])->default('pickup');
            $table->string('label'); // Label tampilan metode pemenuhan/pelayanan.
            $table->unsignedBigInteger('price')->default(0); // dalam cent
            $table->unsignedBigInteger('price_max')->nullable(); // untuk range harga

            $table->timestamps();

            $table->index('product_id');
            $table->unique(['product_id', 'type']);
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
