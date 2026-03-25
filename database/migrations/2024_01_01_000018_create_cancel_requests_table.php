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
     * - evidence: DIHAPUS (pindah ke tabel cancel_request_evidences)
     */
    public function up(): void
    {
        Schema::create('cancel_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('request_number')->unique(); // Format: CR-YYYYMMDD-XXXX

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();

            $table->enum('reason', ['changed_mind', 'found_better_price', 'seller_not_responding', 'other']);
            $table->text('description');

            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');

            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->unsignedBigInteger('refund_amount')->default(0);
            $table->boolean('refund_processed')->default(false);

            $table->timestamps();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            $table->index('order_id');
            $table->index('requester_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cancel_requests');
    }
};
