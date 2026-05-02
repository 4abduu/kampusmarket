<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add seller_confirmed_at column for tracking when seller marks
     * delivery/service as done, so we can auto-confirm after 3 days.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('seller_confirmed_at')->nullable()->after('completed_at');
            $table->timestamp('auto_confirm_deadline')->nullable()->after('seller_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['seller_confirmed_at', 'auto_confirm_deadline']);
        });
    }
};
