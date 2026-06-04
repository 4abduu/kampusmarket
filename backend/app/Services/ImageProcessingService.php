<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;

/**
 * ImageProcessingService — WebP Image Pipeline
 *
 * Generates a single WebP image from an uploaded image without downscaling (native resolution).
 *
 * All images are converted to WebP with quality 82.
 * Uses Intervention Image v3.11.8 (ImageManager with GD Driver).
 *
 * Storage layout (public disk):
 *   {category}/{filename}.webp
 *
 * URL returned to frontend is RELATIVE path (e.g. "products/abc123.webp").
 * The ProductImage model's accessor prepends asset('storage/...') to make it absolute.
 */
class ImageProcessingService
{
    protected string $disk = 'public';

    protected const WEBP_QUALITY = 82;

    protected const VALID_CATEGORIES = ['products', 'ratings', 'profiles', 'messages'];

    /**
     * Process an uploaded image: generate WebP image in original size.
     *
     * @param  string  $tmpPath   Absolute path to the temp file on disk
     * @param  string  $category  Storage sub-folder (products|ratings|profiles|messages)
     * @return array{filename: string, category: string, url: string}
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
        $path = "{$category}/{$filename}.webp";
        
        try {
            Storage::disk($this->disk)->makeDirectory($category);
            
            // Encode as WebP with quality parameter
            $webp = $source->encode(new WebpEncoder(quality: self::WEBP_QUALITY));
            Storage::disk($this->disk)->put($path, (string) $webp);
        } catch (Exception $e) {
            Log::error("Failed to generate image", [
                'category' => $category,
                'error' => $e->getMessage(),
            ]);
            throw new Exception("Gagal membuat gambar: " . $e->getMessage());
        }

        return [
            'filename' => $filename,
            'category' => $category,
            'url'      => $path,
        ];
    }

    /**
     * Delete image and any old variants.
     */
    public function deleteImage(string $filename, string $category = 'products'): bool
    {
        try {
            $path = "{$category}/{$filename}.webp";
            if (Storage::disk($this->disk)->exists($path)) {
                Storage::disk($this->disk)->delete($path);
            }

            // Cleanup old variants if they exist
            $variants = ['thumbnail', 'small', 'medium', 'large', 'original', 'chat'];
            foreach ($variants as $variant) {
                $varPath = "{$category}/{$variant}/{$filename}.webp";
                if (Storage::disk($this->disk)->exists($varPath)) {
                    Storage::disk($this->disk)->delete($varPath);
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
}
