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
     * Sebelumnya: evidence disimpan sebagai JSON string di tabel cancel_requests
     * Sekarang: Setiap evidence menjadi satu row di tabel ini
     */
    public function up(): void
    {
        Schema::create('cancel_request_evidences', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cancel_request_id')->constrained('cancel_requests')->cascadeOnDelete();

            $table->string('url');
            $table->string('type')->nullable(); // 'image', 'document', etc.
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index('cancel_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cancel_request_evidences');
    }
};
