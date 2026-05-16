<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'url',
        'alt',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_primary' => 'boolean',
    ];

    /**
     * Get the product that owns the image.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the full URL for the image.
     *
     * Handles three formats stored in the DB:
     *   1. Full external URL  → "https://images.unsplash.com/..."  → return as-is
     *   2. Relative path      → "products/small/abc123.webp"       → prepend asset('storage/...')
     *   3. Legacy /storage/   → "/storage/products/images/..."     → prepend APP_URL
     */
    public function getUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        // Already a full URL (external images, e.g. Unsplash seeder)
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // Strip any leading "/storage/" that may have been stored accidentally
        $cleanPath = preg_replace('#^/?storage/#', '', $value);

        return asset('storage/' . $cleanPath);
    }

    /**
     * Get the raw (un-mutated) path stored in the database.
     * Useful for building variant URLs from the same base filename.
     */
    public function getRawUrlAttribute(): ?string
    {
        return $this->attributes['url'] ?? null;
    }

    /**
     * Derive the base filename (without variant folder or extension) from the stored URL.
     * e.g. "products/small/abc123_1234567890.webp" → "abc123_1234567890"
     */
    public function getFilenameAttribute(): ?string
    {
        $raw = $this->attributes['url'] ?? null;
        if (!$raw) return null;

        return pathinfo(basename($raw), PATHINFO_FILENAME);
    }

    /**
     * Get the category folder from the stored path.
     * e.g. "products/small/abc.webp" → "products"
     */
    public function getCategoryAttribute(): string
    {
        $raw = $this->attributes['url'] ?? null;
        if (!$raw) return 'products';

        $clean = preg_replace('#^/?storage/#', '', $raw);
        $parts = explode('/', $clean);
        return $parts[0] ?? 'products';
    }

    /**
     * Build URLs for all size variants based on the stored filename.
     *
     * @return array<string, string>  e.g. { thumbnail: "http://...", small: "...", ... }
     */
    public function getVariantUrlsAttribute(): array
    {
        $filename = $this->filename;
        $category = $this->category;

        if (!$filename) {
            $url = $this->url;
            return $url ? ['original' => $url] : [];
        }

        $variants = ['thumbnail', 'small', 'medium', 'large', 'original'];
        $urls = [];

        foreach ($variants as $variant) {
            $path = "{$category}/{$variant}/{$filename}.webp";
            // Check if the variant file actually exists on disk
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                $urls[$variant] = asset("storage/{$path}");
            }
        }

        // If no variants found (e.g. external/seeded image), return primary URL
        if (empty($urls)) {
            $url = $this->url;
            return $url ? ['original' => $url] : [];
        }

        return $urls;
    }

    /**
     * Set as primary image.
     */
    public function setAsPrimary(): void
    {
        // Remove primary from other images
        static::where('product_id', $this->product_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        $this->is_primary = true;
        $this->save();
    }
}
