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
     * - evidence: DIHAPUS (pindah ke tabel report_evidences)
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('report_number')->unique(); // Format: RP-YYYYMMDD-XXXX

            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

            // Report Details
            $table->string('reason');
            $table->text('description');

            // Status
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');

            // Admin Notes
            $table->text('admin_notes')->nullable();
            $table->text('resolution')->nullable();

            $table->timestamps();
            $table->timestamp('resolved_at')->nullable();

            $table->index('reporter_id');
            $table->index('reported_user_id');
            $table->index('status');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
