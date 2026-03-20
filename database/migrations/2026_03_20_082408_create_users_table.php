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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->string('email')->index();
            $table->string('password')->nullable();
            $table->string('google_id')->nullable()->index();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->unsignedBigInteger('faculty_id')->nullable()->index();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->enum('role', ['user', 'admin'])->default('user')->index();
            $table->boolean('is_banned')->default(false)->index();
            $table->text('ban_reason')->nullable();
            $table->boolean('is_warned')->default(false)->index();
            $table->text('warning_reason')->nullable();
            $table->boolean('is_customer_only')->default(false);
            $table->decimal('rating', 3)->default(0);
            $table->integer('review_count')->default(0);
            $table->unsignedBigInteger('wallet_balance')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['email']);
            $table->unique(['google_id']);
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
