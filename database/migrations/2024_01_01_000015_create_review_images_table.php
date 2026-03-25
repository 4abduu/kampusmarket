<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * NORMALISASI 1NF:
     * Sebelumnya: images disimpan sebagai JSON string di tabel reviews
     * Sekarang: Setiap image menjadi satu row di tabel ini
     */
    public function up(): void
    {
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();

            $table->foreignId('review_id')->constrained('reviews')->cascadeOnDelete();

            $table->string('url');
            $table->string('alt')->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index('review_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_images');
    }
};
