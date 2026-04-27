/**
 * lib/api/images.ts [BARU]
 *
 * Upload gambar produk ke backend Laravel.
 * Backend menyimpan ke storage/app/public/products/ dan return URL publik.
 *
 * CATATAN STORAGE:
 * Gambar disimpan lokal di folder project (bukan cloud).
 * Ini sudah cukup untuk development dan MVP.
 * Kalau nanti mau pindah ke cloud (S3/Cloudinary), cukup ganti
 * konfigurasi di backend/config/filesystems.php tanpa ubah frontend.
 *
 * Requirement backend:
 *   php artisan storage:link  ← jalankan sekali setelah clone project
 */

import apiClient from './client';
import { API_BASE_URL } from '@/lib/config';

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Validasi file gambar sebelum upload.
 * Return pesan error atau null jika valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format harus JPEG, PNG, WebP, atau GIF';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Ukuran maksimal ${MAX_SIZE_MB}MB (file ini ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}

/**
 * Upload satu gambar ke backend.
 * Menggunakan FormData karena backend terima multipart/form-data.
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const formData = new FormData();
  formData.append('image', file);

  // Pakai fetch langsung karena apiClient (axios) butuh header override untuk FormData
  const API_BASE = API_BASE_URL;
  const response = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    credentials: 'include', // kirim cookie auth
    body: formData,
    // JANGAN set Content-Type — browser otomatis set multipart/form-data + boundary
  });

  const data = await response.json() as { success: boolean; url: string; path: string; message?: string };

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Gagal upload gambar');
  }

  return { url: data.url, path: data.path };
}

/**
 * Upload multiple gambar secara berurutan.
 * Return array URL dari gambar yang berhasil diupload.
 * Kalau salah satu gagal, throw error dengan info gambar yang gagal.
 */
export async function uploadImages(
  files: File[],
  onProgress?: (uploaded: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length);
    const result = await uploadImage(files[i]);
    urls.push(result.url);
  }

  onProgress?.(files.length, files.length);
  return urls;
}
