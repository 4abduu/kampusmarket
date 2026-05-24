<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;

/**
 * ImageProcessingService — Industry-Standard Multi-Variant WebP Pipeline
 *
 * Generates multiple size variants from a single uploaded image:
 *   - thumbnail : 150px  (card thumbnails, lists)
 *   - small     : 320px  (mobile cards, chat previews)
 *   - medium    : 640px  (tablet / half-width grids)
 *   - large     : 1024px (desktop detail pages, main gallery)
 *   - original  : full   (zoom / full-screen / download)
 *
 * All variants are WebP with quality 90 (sweet spot: quality ≈ JPEG q95, size ≈ JPEG q70).
 * Uses Intervention Image v3.11.8 (ImageManager with GD Driver).
 *
 * Storage layout (public disk):
 *   {category}/thumbnail/{filename}.webp
 *   {category}/small/{filename}.webp
 *   {category}/medium/{filename}.webp
 *   {category}/large/{filename}.webp
 *   {category}/original/{filename}.webp
 *
 * URL returned to frontend is RELATIVE path (e.g. "products/small/abc123.webp").
 * The ProductImage model's accessor prepends asset('storage/...') to make it absolute.
 */
class ImageProcessingService
{
    protected string $disk = 'public';

    /**
     * Size variants: folder => max dimension (longest side).
     * null = keep original dimensions.
     */
    protected const VARIANTS = [
        'thumbnail' => 150,
        'small'     => 320,
        'medium'    => 640,
        'large'     => 1024,
        'original'  => null,
    ];

    protected const WEBP_QUALITY = 82;

    protected const VALID_CATEGORIES = ['products', 'ratings', 'profiles', 'messages'];

    /**
     * Process an uploaded image: generate all WebP variants.
     *
     * @param  string  $tmpPath   Absolute path to the temp file on disk
     * @param  string  $category  Storage sub-folder (products|ratings|profiles|messages)
     * @return array{filename: string, category: string, url: string, urls: array<string, string>}
     */
    public function processImage(string $tmpPath, string $category = 'products'): array
    {
        if (!in_array($category, self::VALID_CATEGORIES, true)) {
            throw new Exception("Invalid image category: {$category}");
        }

        try {
            // Read image using Intervention Image v3 ImageManager
            $manager = new ImageManager(new Driver());
            $source = $manager->read($tmpPath);
        } catch (Exception $e) {
            Log::error('Failed to read image file', [
                'path' => $tmpPath,
                'error' => $e->getMessage(),
            ]);
            throw new Exception('Gambar tidak dapat diproses. File mungkin rusak atau format tidak sesuai.');
        }

        $filename = uniqid() . '_' . time();
        $urls     = [];

        $variants = self::VARIANTS;
        if ($category === 'messages') {
            $variants = [
                'chat'     => null,
                'small'    => 320,
                'medium'   => 640,
                'original' => null,
            ];
        }

        foreach ($variants as $variant => $maxSide) {
            $dir = "{$category}/{$variant}";
            Storage::disk($this->disk)->makeDirectory($dir);

            try {
                // Clone the source for each variant using PHP's clone
                $image = clone $source;

                // Scale down (preserve aspect ratio) if a max-side is specified
                // scaleDown() never upscales, only downscales with aspect ratio preserved
                if ($maxSide !== null) {
                    $image = $image->scaleDown($maxSide, $maxSide);
                }

                // Encode as WebP with quality parameter
                $webp = $image->encode(new WebpEncoder(quality: self::WEBP_QUALITY));
                $path = "{$dir}/{$filename}.webp";
                Storage::disk($this->disk)->put($path, (string) $webp);

                // Store the RELATIVE path (no /storage/ prefix).
                // The model accessor will build the full URL.
                $urls[$variant] = $path;
            } catch (Exception $e) {
                Log::error("Failed to generate image variant", [
                    'variant' => $variant,
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
                throw new Exception("Gagal membuat varian gambar '{$variant}': " . $e->getMessage());
            }
        }

        return [
            'filename' => $filename,
            'category' => $category,
            // Primary URL points to the 'chat' variant if category is messages, otherwise 'small'
            'url'      => $category === 'messages' ? $urls['chat'] : $urls['small'],
            // All variants for frontend <picture>/<srcset> usage
            'urls'     => $urls,
        ];
    }

    /**
     * Delete all variants of an image.
     */
    public function deleteImage(string $filename, string $category = 'products'): bool
    {
        try {
            $variants = array_keys(self::VARIANTS);
            if ($category === 'messages') {
                $variants = ['chat', 'small', 'medium', 'original'];
            }

            foreach ($variants as $variant) {
                $path = "{$category}/{$variant}/{$filename}.webp";
                if (Storage::disk($this->disk)->exists($path)) {
                    Storage::disk($this->disk)->delete($path);
                }
            }

            // Also clean up legacy flat path if it exists
            $legacyPath = "{$category}/images/{$filename}.webp";
            if (Storage::disk($this->disk)->exists($legacyPath)) {
                Storage::disk($this->disk)->delete($legacyPath);
            }

            return true;
        } catch (Exception $e) {
            Log::error("Image deletion failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Build absolute URLs for all variants from a base filename.
     * Useful when you need to regenerate the URL map from just the filename.
     */
    public function getVariantUrls(string $filename, string $category = 'products'): array
    {
        $urls = [];
        foreach (array_keys(self::VARIANTS) as $variant) {
            $path = "{$category}/{$variant}/{$filename}.webp";
            if (Storage::disk($this->disk)->exists($path)) {
                $urls[$variant] = asset("storage/{$path}");
            }
        }
        return $urls;
    }
}
