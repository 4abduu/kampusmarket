<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ImageController extends Controller
{
    protected ImageProcessingService $imageProcessingService;

    public function __construct(ImageProcessingService $imageProcessingService)
    {
        $this->imageProcessingService = $imageProcessingService;
    }

    /**
     * POST /api/images/upload
     *
     * Upload an image, generate all WebP variants, and return URLs.
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'image' => [
                    'required',
                    'file',
                    'image',
                    'mimes:jpeg,jpg,png,webp,gif',
                    'max:2048', // 2MB
                ],
                'category' => ['sometimes', 'string', 'in:products,ratings,profiles,messages'],
                'alt' => ['sometimes', 'string', 'max:255'],
            ], [
                'image.max' => 'Ukuran gambar maksimal 2MB',
                'image.mimes' => 'Format gambar harus jpeg, png, webp, atau gif',
            ]);

            $file = $request->file('image');
            $category = $request->input('category', 'products');
            $alt = $request->input('alt', '');

            // Save to temp first
            $tempPath = $file->store('temp', 'local');
            $fullTmpPath = Storage::disk('local')->path($tempPath);

            // Process → generates all WebP variants
            $imageData = $this->imageProcessingService->processImage($fullTmpPath, $category);

            // Clean up temp
            Storage::disk('local')->delete($tempPath);

            return response()->json([
                'success'  => true,
                // Primary URL (small variant, relative path for DB storage)
                'url'      => $imageData['url'],
                // All variant URLs (relative paths)
                'urls'     => $imageData['urls'],
                'filename' => $imageData['filename'],
                'category' => $category,
                'alt'      => $alt,
            ]);

        } catch (Throwable $e) {
            Log::error('Image upload failed', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal upload gambar: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * DELETE /api/images/{filename}
     *
     * Delete all variants of an image.
     */
    public function delete(Request $request, string $filename): JsonResponse
    {
        try {
            $request->validate([
                'category' => ['sometimes', 'string', 'in:products,ratings,profiles,messages'],
            ]);

            $category = $request->input('category', 'products');

            $this->imageProcessingService->deleteImage($filename, $category);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil dihapus',
            ]);

        } catch (Throwable $e) {
            Log::error('Image deletion failed', [
                'error'    => $e->getMessage(),
                'filename' => $filename,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus gambar',
            ], 422);
        }
    }
}
