<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add column comments to computed cache columns
     * to document that they are managed by Observers.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->comment('computed cache - managed by Observer')->change();
            $table->integer('review_count')->default(0)->comment('computed cache - managed by Observer')->change();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->comment('computed cache - managed by Observer')->change();
            $table->integer('review_count')->default(0)->comment('computed cache - managed by Observer')->change();
            $table->integer('sold_count')->default(0)->comment('computed cache - managed by Observer')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Remove column comments (set to null/empty).
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->comment('')->change();
            $table->integer('review_count')->default(0)->comment('')->change();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->comment('')->change();
            $table->integer('review_count')->default(0)->comment('')->change();
            $table->integer('sold_count')->default(0)->comment('')->change();
        });
    }
};
