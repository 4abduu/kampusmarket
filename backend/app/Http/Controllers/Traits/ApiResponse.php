<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

/**
 * Trait ApiResponse
 * 
 * Provides consistent response formatting for all API controllers.
 * Usage: use ApiResponse trait in any controller class.
 */
trait ApiResponse
{
    /**
     * Success response with data.
     */
    public function success($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Error response.
     */
    public function error(string $message = 'Error', $data = null, int $code = 400): JsonResponse
    {
        if ($code >= 500) {
            \Illuminate\Support\Facades\Log::error('[ApiResponse] Server error response', [
                'message' => $message,
                'data' => $data,
            ]);

            $message = 'Mohon maaf, terjadi kesalahan pada server. Silakan coba lagi.';
            $data = null;
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Paginated response.
     */
    public function paginated(LengthAwarePaginator $paginator, $data, string $message = 'Success', array $additionalMeta = []): JsonResponse
    {
        $meta = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];

        if (!empty($additionalMeta)) {
            $meta = array_merge($meta, $additionalMeta);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    /**
     * Created response (201).
     */
    public function created($data = null, string $message = 'Created'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], 201);
    }

    /**
     * No content response (204).
     */
    public function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Unauthorized response (401).
     */
    public function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }

    /**
     * Forbidden response (403).
     */
    public function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 403);
    }

    /**
     * Not found response (404).
     */
    public function notFound(string $message = 'Not found'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    /**
     * Validation error response (422).
     */
    public function unprocessable(string $message = 'Validation failed', $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], 422);
    }

    /**
     * Server error response (500).
     */
    public function serverError(string $message = 'Server error', $data = null): JsonResponse
    {
        \Illuminate\Support\Facades\Log::error('[ApiResponse] Server error response', [
            'message' => $message,
            'data' => $data,
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Mohon maaf, terjadi kesalahan pada server. Silakan coba lagi.',
            'data' => null,
        ], 500);
    }
}
