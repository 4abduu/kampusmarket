<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Drop foreign key & unique constraint dulu
            $table->dropForeign(['product_id']);
            $table->dropUnique(['product_id', 'buyer_id', 'seller_id']);

            // Ubah jadi nullable
            $table->foreignId('product_id')->nullable()->change();

            // Tambah foreign key nullable + unique partial
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();

            // Unique constraint baru: boleh null product_id tapi seller+buyer tetap unique
            // Pakai unique index per kombinasi
            $table->unique(['product_id', 'buyer_id', 'seller_id']);
        });
    }

    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropUnique(['product_id', 'buyer_id', 'seller_id']);
            $table->foreignId('product_id')->nullable(false)->change();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->unique(['product_id', 'buyer_id', 'seller_id']);
        });
    }
};
