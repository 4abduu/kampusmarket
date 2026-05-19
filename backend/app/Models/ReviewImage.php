<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'url',
        'alt',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the review that owns the image.
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Get the full URL.
     */
    public function getUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // Clean up leading slash if present
        $cleanValue = ltrim($value, '/');

        // Check if the value already starts with storage/
        if (str_starts_with($cleanValue, 'storage/')) {
            return asset($cleanValue);
        }

        return asset('storage/' . $cleanValue);
    }
}
