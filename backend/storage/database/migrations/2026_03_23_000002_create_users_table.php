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
     * - faculty: String → faculty_id: Foreign Key (3NF)
     * - role: String → ENUM
     * - walletBalance: Int → BIGINT (untuk MySQL)
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Auth
            $table->string('email')->unique();
            $table->string('password')->nullable(); // null jika Google OAuth
            $table->string('google_id')->nullable()->unique();

            // Profile
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();

            // Faculty (3NF - Foreign Key ke tabel faculties)
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->nullOnDelete();

            // Verification
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_verified')->default(false);

            // Role & Status
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->boolean('is_banned')->default(false);
            $table->text('ban_reason')->nullable();
            $table->boolean('is_warned')->default(false);
            $table->text('warning_reason')->nullable();

            // Stats
            $table->decimal('rating', 3, 2)->default(0); // 0.00 - 5.00
            $table->integer('review_count')->default(0);

            // Wallet (BIGINT untuk menyimpan cent - Rupiah * 100)
            $table->unsignedBigInteger('wallet_balance')->default(0);

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('email');
            $table->index('google_id');
            $table->index('role');
            $table->index('faculty_id');
            $table->index('is_banned');
            $table->index('is_warned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
