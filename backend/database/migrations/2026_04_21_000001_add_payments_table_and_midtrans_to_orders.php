<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'midtrans' to orders.payment_method enum (MySQL)
        if (Schema::hasTable('orders')) {
            try {
                DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('balance','cod','transfer','midtrans') NOT NULL DEFAULT 'balance'");
            } catch (\Throwable $e) {
                // If the DB driver doesn't support direct enum modification, skip and rely on a future manual migration.
            }
        }

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();

            // Gateway and method details
            $table->string('payment_gateway')->default('midtrans'); // e.g. 'midtrans', 'wallet'
            $table->string('payment_method')->nullable(); // e.g. 'bank_transfer', 'gopay', 'credit_card'

            // Provider transaction identifiers
            $table->string('transaction_id')->nullable(); // midtrans transaction id / order_id

            // Amounts stored in cent (unsignedBigInteger to align with orders)
            $table->unsignedBigInteger('gross_amount')->default(0);
            $table->string('currency', 10)->default('IDR');

            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');

            // Raw provider response for debugging/audit
            $table->json('raw_response')->nullable();

            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->index('transaction_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');

        if (Schema::hasTable('orders')) {
            try {
                DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('balance','cod','transfer') NOT NULL DEFAULT 'balance'");
            } catch (\Throwable $e) {
                // ignore
            }
        }
    }
};
