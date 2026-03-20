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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->string('withdrawal_number')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('amount')->default(0);
            $table->unsignedBigInteger('total_deduction')->default(0);
            $table->enum('account_type', ['bank', 'e_wallet'])->default('bank');
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_name');
            $table->enum('status', ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            $table->timestamp('processed_at')->nullable();

            $table->unique(['withdrawal_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
