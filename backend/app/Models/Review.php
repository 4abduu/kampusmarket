<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'order_id',
        'reviewer_id',
        'reviewee_id',
        'product_id',
        'rating',
        'comment',
        'seller_response',
        'seller_responded_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'seller_responded_at' => 'datetime',
    ];

    /**
     * Get the order for the review.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the reviewer (user who wrote the review).
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the reviewee (user being reviewed).
     */
    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }

    /**
     * Get the product being reviewed.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the images for the review.
     */
    public function images()
    {
        return $this->hasMany(ReviewImage::class)->orderBy('sort_order');
    }

    /**
     * Get image URLs as array.
     */
    public function getImageUrls(): array
    {
        return $this->images->pluck('url')->toArray();
    }

    /**
     * Scope by rating.
     */
    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope by reviewee.
     */
    public function scopeByReviewee($query, int $revieweeId)
    {
        return $query->where('reviewee_id', $revieweeId);
    }

    /**
     * Respond to review (seller response).
     */
    public function respond(string $response): void
    {
        $this->seller_response = $response;
        $this->seller_responded_at = now();
        $this->save();
    }

    /**
     * Check if seller has responded.
     */
    public function hasSellerResponse(): bool
    {
        return !is_null($this->seller_response);
    }
}
