<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // 1. Drop Foreign Key yang nempel ke product_id terlebih dahulu
            // Laravel default penamaannya: namaTable_namaKolom_foreign
            $table->dropForeign(['product_id']); 

            // Jika buyer_id dan seller_id juga ikut error, drop juga FK-nya:
            // $table->dropForeign(['buyer_id']);
            // $table->dropForeign(['seller_id']);

            // 2. Sekarang baru aman untuk drop unique key lama
            $table->dropUnique(['product_id', 'buyer_id', 'seller_id']);

            // 3. Tambah unique baru
            $table->unique(['buyer_id', 'seller_id']);

            // 4. Pasang kembali Foreign Key product_id yang tadi di-drop
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            
            // Pasang kembali FK buyer & seller jika tadi sempat di-drop:
            // $table->foreign('buyer_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('seller_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Balikin prosesnya ke semula kalau di-rollback
            $table->dropUnique(['buyer_id', 'seller_id']);
            $table->unique(['product_id', 'buyer_id', 'seller_id']);
        });
    }
};