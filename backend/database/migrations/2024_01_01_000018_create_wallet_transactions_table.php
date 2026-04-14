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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('type', ['top_up', 'withdrawal', 'payment', 'refund', 'income', 'admin_fee']);

            $table->unsignedBigInteger('amount'); // dalam cent
            $table->unsignedBigInteger('balance_before')->default(0);
            $table->unsignedBigInteger('balance_after')->default(0);
            $table->text('description')->nullable();

            // Reference to related entities
            $table->foreignId('related_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('related_withdrawal_id')->nullable()->constrained('withdrawals')->nullOnDelete();

            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('completed');

            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('related_order_id');
            $table->index('related_withdrawal_id');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
