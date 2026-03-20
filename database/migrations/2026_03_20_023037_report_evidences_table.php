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
     * Sebelumnya: evidence disimpan sebagai JSON string di tabel reports
     * Sekarang: Setiap evidence menjadi satu row di tabel ini
     */
    public function up(): void
    {
        Schema::create('report_evidences', function (Blueprint $table) {
            $table->id();

            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();

            $table->string('url');
            $table->string('type')->nullable(); // 'image', 'document', etc.
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index('report_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_evidences');
    }
};
