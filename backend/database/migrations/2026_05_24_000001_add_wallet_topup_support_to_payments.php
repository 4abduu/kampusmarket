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
        Schema::table('payments', function (Blueprint $table) {
            // Make order_id nullable to support wallet top-ups
            $table->foreignId('order_id')->nullable()->change();

            // Add user_id for wallet top-ups
            if (!Schema::hasColumn('payments', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            }

            // Add type to distinguish between order payments and wallet top-ups
            if (!Schema::hasColumn('payments', 'type')) {
                $table->enum('type', ['order', 'wallet_topup'])->default('order');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Restore order_id as required
            $table->foreignId('order_id')->nullable(false)->change();

            // Drop new columns
            if (Schema::hasColumn('payments', 'user_id')) {
                $table->dropForeignIdFor('User');
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('payments', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
