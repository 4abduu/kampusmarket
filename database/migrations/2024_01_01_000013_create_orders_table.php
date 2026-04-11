<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Perubahan dari Prisma:
     * - Semua status menggunakan ENUM (3NF)
     * - Harga menggunakan BIGINT
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Order Number
            $table->string('order_number')->unique(); // Format: KM-YYYYMMDD-XXXX

            // Product Snapshot (untuk audit trail)
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('product_title'); // Snapshot
            $table->enum('product_type', ['barang', 'jasa']); // Snapshot

            // Users
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();

            // Pricing (BIGINT untuk cent)
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('base_price')->default(0);
            $table->unsignedBigInteger('nego_price')->nullable();
            $table->unsignedBigInteger('final_price')->default(0);
            $table->unsignedBigInteger('shipping_fee')->default(0);
            $table->decimal('admin_fee_percent', 5, 2)->default(5.00);
            $table->unsignedBigInteger('admin_fee_deducted')->default(0);
            $table->unsignedBigInteger('total_price')->default(0);
            $table->unsignedBigInteger('net_income')->default(0);

            // Shipping
            $table->enum('shipping_type', ['cod', 'pickup', 'delivery', 'online', 'onsite', 'home_service']);
            $table->string('shipping_method')->nullable();
            $table->text('shipping_address')->nullable();
            $table->text('shipping_notes')->nullable();
            $table->foreignId('selected_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->string('tracking_number')->nullable();

            // Service Booking (untuk jasa)
            $table->date('service_date')->nullable();
            $table->time('service_time')->nullable();
            $table->timestamp('service_deadline')->nullable();
            $table->text('service_notes')->nullable();

            // Variable Pricing untuk Jasa
            $table->unsignedBigInteger('offered_price')->nullable();
            $table->text('price_offer_notes')->nullable();

            // Payment
            $table->enum('payment_method', ['balance', 'cod', 'transfer'])->default('balance');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();

            // Status utama order (sinkron dengan flow di OrderDetail)
            $table->enum('status', [
                'pending',
                'waiting_price',
                'waiting_confirmation',
                'waiting_shipping_fee',
                'waiting_payment',
                'processing',
                'ready_pickup',
                'in_delivery',
                'completed',
                'cancelled'
            ])->default('pending');

            // Cancellation
            // direct: dibatalkan langsung tanpa approval admin
            // requested: ada proses pengajuan pembatalan lewat cancel_requests
            $table->enum('cancellation_flow', ['none', 'direct', 'requested'])->default('none');
            $table->enum('cancellation_status', [
                'none',
                'request_pending',
                'request_approved',
                'request_rejected',
                'cancelled_direct',
                'cancelled_after_approval'
            ])->default('none');
            $table->foreignId('cancelled_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Completion
            $table->timestamp('completed_at')->nullable();

            // Notes
            $table->text('notes')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('order_number');
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('status');
            $table->index('cancellation_status');
            $table->index('payment_status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
