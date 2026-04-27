<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Convert all prices from cents (x100) to direct IDR values
     */
    public function up(): void
    {
        // Convert prices by dividing by 100 (from cent to rupiah)
        DB::statement('UPDATE products SET price = CEIL(price / 100) WHERE price > 0');
        DB::statement('UPDATE products SET original_price = CEIL(original_price / 100) WHERE original_price IS NOT NULL AND original_price > 0');
        DB::statement('UPDATE products SET price_min = CEIL(price_min / 100) WHERE price_min IS NOT NULL AND price_min > 0');
        DB::statement('UPDATE products SET price_max = CEIL(price_max / 100) WHERE price_max IS NOT NULL AND price_max > 0');
        
        // Also convert shipping_options prices
        DB::statement('UPDATE shipping_options SET price = CEIL(price / 100) WHERE price > 0');
        DB::statement('UPDATE shipping_options SET price_max = CEIL(price_max / 100) WHERE price_max IS NOT NULL AND price_max > 0');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse: multiply prices by 100 (rupiah to cent)
        DB::statement('UPDATE products SET price = price * 100 WHERE price > 0');
        DB::statement('UPDATE products SET original_price = original_price * 100 WHERE original_price IS NOT NULL AND original_price > 0');
        DB::statement('UPDATE products SET price_min = price_min * 100 WHERE price_min IS NOT NULL AND price_min > 0');
        DB::statement('UPDATE products SET price_max = price_max * 100 WHERE price_max IS NOT NULL AND price_max > 0');
        
        // Also convert shipping_options prices back
        DB::statement('UPDATE shipping_options SET price = price * 100 WHERE price > 0');
        DB::statement('UPDATE shipping_options SET price_max = price_max * 100 WHERE price_max IS NOT NULL AND price_max > 0');
    }
};
