<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'product_id',
    ];

    /**
     * Get the user that owns the favorite.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that is favorited.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Toggle favorite for user and product.
     */
    public static function toggle(int $userId, int $productId): bool
    {
        $favorite = static::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return false; // Removed
        }

        static::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);
        return true; // Added
    }

    /**
     * Check if product is favorited by user.
     */
    public static function isFavorited(int $userId, int $productId): bool
    {
        return static::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();
    }
}
