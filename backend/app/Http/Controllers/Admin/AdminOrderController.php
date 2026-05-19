<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin Order Controller
 * Mengelola transaksi/pesanan dari sisi administrator.
 */
class AdminOrderController extends Controller
{
    /**
     * Display a listing of all orders for admin.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with([
                'product.category',
                'buyer',
                'seller',
            ]);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by payment status
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            // Filter by product type
            if ($request->has('type')) {
                $query->where('product_type', $request->type);
            }

            // Filter by category (product relation)
            if ($request->has('category_id')) {
                $categoryId = $request->category_id;
                $query->whereHas('product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                });
            }

            // Search by order number, product title, buyer/seller name or uuid
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('product_title', 'like', "%{$search}%")
                        ->orWhere('uuid', '=', $search)
                        ->orWhereHas('buyer', function ($qb) use ($search) {
                            $qb->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%")
                               ->orWhere('uuid', '=', $search);
                        })
                        ->orWhereHas('seller', function ($qs) use ($search) {
                            $qs->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%")
                               ->orWhere('uuid', '=', $search);
                        });
                });
            }

            // Sort
            $allowedSorts = [
                'created_at',
                'total_price',
                'payment_status',
                'status',
            ];
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            if (!in_array($sortOrder, ['asc', 'desc'], true)) {
                $sortOrder = 'desc';
            }
            if (!in_array($sortBy, $allowedSorts, true)) {
                $sortBy = 'created_at';
            }
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $orders = $query->paginate($perPage);

            Log::info('[AdminOrderController] Orders fetched', [
                'total' => $orders->total(),
                'per_page' => $perPage,
            ]);

            return response()->json([
                'success' => true,
                'data' => OrderResource::collection($orders),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminOrderController] Error fetching orders', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data transaksi',
            ], 500);
        }
    }
}
