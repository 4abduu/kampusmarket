<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * ImageController [BARU]
 *
 * Handle upload gambar produk ke storage Laravel lokal.
 * Gambar disimpan di storage/app/public/products/{uuid}.{ext}
 * dan dapat diakses via URL: APP_URL/storage/products/{filename}
 *
 * Setup yang diperlukan (jalankan sekali):
 *   php artisan storage:link
 *
 * Ini membuat symlink dari public/storage → storage/app/public
 * sehingga gambar bisa diakses via browser.
 *
 * Kenapa simpan lokal dulu?
 * - Zero config, langsung jalan
 * - Mudah migrate ke cloud (S3/Cloudinary) cukup ganti disk di filesystems.php
 * - Aman untuk development dan MVP
 */
class ImageController extends Controller
{
    /**
     * POST /api/images/upload
     *
     * Upload satu gambar produk.
     * Limit: 2MB, format: jpeg/png/webp/gif
     *
     * Response: { success: true, url: "http://localhost:8000/storage/products/xxx.webp" }
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp,gif',
                'max:2048', // 2MB dalam kilobytes
            ],
        ], [
            'image.max'    => 'Ukuran gambar maksimal 2MB',
            'image.mimes'  => 'Format gambar harus jpeg, png, webp, atau gif',
            'image.image'  => 'File harus berupa gambar',
        ]);

        $file = $request->file('image');

        // Generate nama file unik: products/{uuid}.{ext}
        $ext      = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::uuid() . '.' . strtolower($ext);
        $path     = 'products/' . $filename;

        // Simpan ke storage/app/public/products/
        Storage::disk('public')->put($path, file_get_contents($file->getRealPath()));

        // URL yang bisa diakses browser setelah php artisan storage:link
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'success' => true,
            'url'     => $url,
            'path'    => $path,
        ]);
    }

    /**
     * DELETE /api/images
     *
     * Hapus gambar dari storage (opsional, untuk cleanup).
     * Body: { path: "products/xxx.jpg" }
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'path' => ['required', 'string', 'max:500'],
        ]);

        $path = $request->path;

        // Keamanan: pastikan path ada di folder products/
        if (!str_starts_with($path, 'products/')) {
            return response()->json(['success' => false, 'message' => 'Path tidak valid'], 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json(['success' => true, 'message' => 'Gambar dihapus']);
    }
}
