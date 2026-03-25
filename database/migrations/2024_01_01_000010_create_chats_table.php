<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Note: order_id reference will be added later after orders table is created
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();

            // Link to order (optional) - will be added after orders table
            $table->unsignedBigInteger('order_id')->nullable();

            // Last message cache
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();

            // Unread counters
            $table->unsignedInteger('buyer_unread')->default(0);
            $table->unsignedInteger('seller_unread')->default(0);

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Unique constraint: satu chat per produk per buyer-seller pair
            $table->unique(['product_id', 'buyer_id', 'seller_id']);
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('order_id');
        });

        // Add foreign key constraint after orders table is created
        // This will be done in a separate migration or after orders table
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
