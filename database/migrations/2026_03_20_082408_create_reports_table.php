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
        Schema::create('reports', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->string('report_number')->unique();
            $table->unsignedBigInteger('reporter_id')->index();
            $table->unsignedBigInteger('reported_user_id')->index();
            $table->unsignedBigInteger('product_id')->nullable()->index('reports_product_id_foreign');
            $table->string('reason');
            $table->text('description');
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending')->index();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->index();
            $table->text('admin_notes')->nullable();
            $table->text('resolution')->nullable();
            $table->timestamps();
            $table->timestamp('resolved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
