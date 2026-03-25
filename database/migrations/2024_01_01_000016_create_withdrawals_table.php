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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('withdrawal_number')->unique(); // Format: WD-YYYYMMDD-XXXX

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Amount (BIGINT untuk cent)
            $table->unsignedBigInteger('amount')->default(0);
            $table->unsignedBigInteger('total_deduction')->default(0);

            // Account Info
            $table->enum('account_type', ['bank', 'e_wallet'])->default('bank');
            $table->string('bank_name'); // BCA, OVO, DANA, etc.
            $table->string('account_number');
            $table->string('account_name');

            // Status
            $table->enum('status', [
                'pending',
                'approved',
                'processing',
                'completed',
                'failed',
                'cancelled',
                'rejected'
            ])->default('pending');

            $table->text('rejection_reason')->nullable();
            $table->text('failure_reason')->nullable();

            // Timestamps
            $table->timestamps();
            $table->timestamp('processed_at')->nullable();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('withdrawal_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
