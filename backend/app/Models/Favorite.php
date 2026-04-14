<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
     * Create a favorite for a user and product.
     */
    public static function createForUser(int $userId, int $productId): self
    {
        return static::firstOrCreate([
            'user_id' => $userId,
            'product_id' => $productId,
        ], [
            'uuid' => (string) Str::uuid(),
        ]);
    }

    /**
     * Remove a favorite for a user and product.
     */
    public static function removeForUser(int $userId, int $productId): bool
    {
        return (bool) static::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();
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
