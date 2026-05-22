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
        Schema::create('password_reset_otps', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('email');
            $table->string('otp', 6); // 6 digit code
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);

            $table->timestamps();

            $table->index('email');
            $table->index(['email', 'otp']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_otps');
    }
};
