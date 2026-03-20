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
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->string('order_number')->index();
            $table->unsignedBigInteger('product_id')->index('orders_product_id_foreign');
            $table->string('product_title');
            $table->enum('product_type', ['barang', 'jasa']);
            $table->unsignedBigInteger('buyer_id')->index();
            $table->unsignedBigInteger('seller_id')->index();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('base_price')->default(0);
            $table->unsignedBigInteger('nego_price')->nullable();
            $table->unsignedBigInteger('final_price')->default(0);
            $table->unsignedBigInteger('shipping_fee')->default(0);
            $table->decimal('admin_fee_percent', 5)->default(5);
            $table->unsignedBigInteger('admin_fee_deducted')->default(0);
            $table->unsignedBigInteger('total_price')->default(0);
            $table->unsignedBigInteger('net_income')->default(0);
            $table->enum('shipping_type', ['cod', 'pickup', 'delivery', 'online', 'onsite', 'home_service']);
            $table->string('shipping_method')->nullable();
            $table->text('shipping_address')->nullable();
            $table->text('shipping_notes')->nullable();
            $table->unsignedBigInteger('selected_address_id')->nullable()->index('orders_selected_address_id_foreign');
            $table->string('tracking_number')->nullable();
            $table->date('service_date')->nullable();
            $table->time('service_time')->nullable();
            $table->timestamp('service_deadline')->nullable();
            $table->text('service_notes')->nullable();
            $table->unsignedBigInteger('offered_price')->nullable();
            $table->text('price_offer_notes')->nullable();
            $table->enum('payment_method', ['balance', 'cod', 'transfer'])->default('balance');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->enum('status', ['pending', 'waiting_price', 'waiting_confirmation', 'waiting_shipping_fee', 'waiting_payment', 'processing', 'ready_pickup', 'in_delivery', 'completed', 'cancelled'])->default('pending')->index();
            $table->unsignedBigInteger('cancelled_by_id')->nullable()->index('orders_cancelled_by_id_foreign');
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable()->index();
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();

            $table->unique(['order_number']);
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
