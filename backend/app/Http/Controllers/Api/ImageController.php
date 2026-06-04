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
            // Validate request
            $validated = $request->validate([
                'image' => [
                    'required',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048', // 2MB
                ],
                'category' => ['nullable', 'string', 'in:products,ratings,profiles,messages'],
                'alt' => ['sometimes', 'string', 'max:255'],
            ], [
                'image.required' => 'File gambar wajib diunggah',
                'image.image' => 'File harus berupa gambar',
                'image.max' => 'Ukuran gambar maksimal 2MB',
                'image.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp',
            ]);

            $file = $request->file('image');
            $category = $request->input('category', 'profiles');
            $alt = $request->input('alt', '');

            Log::info('Image upload attempt', [
                'file_name' => $file?->getClientOriginalName(),
                'file_size' => $file?->getSize(),
                'file_mime' => $file?->getMimeType(),
                'category' => $category,
            ]);

            // Save to temp first
            $tempPath = $file->store('temp', 'local');
            $fullTmpPath = Storage::disk('local')->path($tempPath);

            // Process → generates all WebP variants
            $imageData = $this->imageProcessingService->processImage($fullTmpPath, $category);

            // Clean up temp
            Storage::disk('local')->delete($tempPath);

            return response()->json([
                'success'  => true,
                // Primary URL
                'url'      => $imageData['url'],
                'filename' => $imageData['filename'],
                'category' => $category,
                'alt'      => $alt,
            ]);

        } catch (Throwable $e) {
            $file = $request->file('image');
            Log::error('Image upload failed', [
                'file_name' => $file?->getClientOriginalName(),
                'file_size' => $file?->getSize(),
                'file_mime' => $file?->getMimeType(),
                'error_message' => $e->getMessage(),
                'class' => get_class($e),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses gambar. Pastikan format dan ukuran sesuai.',
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
                'message' => 'Gagal menghapus gambar.',
            ], 422);
        }
    }
}
