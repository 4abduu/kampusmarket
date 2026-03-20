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
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->foreign(['related_order_id'])->references(['id'])->on('orders')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['related_withdrawal_id'])->references(['id'])->on('withdrawals')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['user_id'])->references(['id'])->on('users')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropForeign('wallet_transactions_related_order_id_foreign');
            $table->dropForeign('wallet_transactions_related_withdrawal_id_foreign');
            $table->dropForeign('wallet_transactions_user_id_foreign');
        });
    }
};
