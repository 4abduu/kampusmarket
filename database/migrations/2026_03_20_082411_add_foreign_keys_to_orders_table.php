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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign(['buyer_id'])->references(['id'])->on('users')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['cancelled_by_id'])->references(['id'])->on('users')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['product_id'])->references(['id'])->on('products')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['selected_address_id'])->references(['id'])->on('addresses')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['seller_id'])->references(['id'])->on('users')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign('orders_buyer_id_foreign');
            $table->dropForeign('orders_cancelled_by_id_foreign');
            $table->dropForeign('orders_product_id_foreign');
            $table->dropForeign('orders_selected_address_id_foreign');
            $table->dropForeign('orders_seller_id_foreign');
        });
    }
};
