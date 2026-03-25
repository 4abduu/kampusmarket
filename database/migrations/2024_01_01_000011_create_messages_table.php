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
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('chat_id')->constrained('chats')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();

            // Content
            $table->text('content');
            $table->enum('type', ['text', 'offer', 'image', 'file', 'system'])->default('text');

            // Offer fields (jika type = 'offer')
            $table->unsignedBigInteger('offer_price')->nullable(); // dalam cent
            $table->enum('offer_status', ['pending', 'accepted', 'rejected'])->nullable();

            // File/Image
            $table->string('file_url')->nullable();

            // Read status
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index('chat_id');
            $table->index('sender_id');
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
