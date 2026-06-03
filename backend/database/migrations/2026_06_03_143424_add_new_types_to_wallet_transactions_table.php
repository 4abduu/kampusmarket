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
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->enum('type', ['top_up', 'withdrawal', 'payment', 'refund', 'income', 'admin_fee', 'cod_fee_deduction', 'debt_payment'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->enum('type', ['top_up', 'withdrawal', 'payment', 'refund', 'income', 'admin_fee'])->change();
        });
    }
};
