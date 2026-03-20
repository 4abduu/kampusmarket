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
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36)->unique();
            $table->unsignedBigInteger('chat_id')->index();
            $table->unsignedBigInteger('sender_id')->index();
            $table->text('content');
            $table->enum('type', ['text', 'offer', 'image', 'file', 'system'])->default('text');
            $table->unsignedBigInteger('offer_price')->nullable();
            $table->enum('offer_status', ['pending', 'accepted', 'rejected'])->nullable();
            $table->string('file_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['chat_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
