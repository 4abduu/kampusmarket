<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CancelRequest;
use App\Models\Order;
use App\Http\Resources\CancelRequestResource;
use App\Http\Requests\StoreCancelRequestRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;

class CancelRequestController extends Controller
{
    /**
     * Display a listing of cancel requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CancelRequest::with(['order', 'requester'])
            ->where('requester_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $requests = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CancelRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Store a newly created cancel request.
     */
    public function store(StoreCancelRequestRequest $request): JsonResponse
    {
        $order = Order::where('uuid', $request->orderId)->firstOrFail();

        // Check if user is buyer or seller of the order
        $user = $request->user();
        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini',
            ], 403);
        }

        // Check if order can be cancelled
        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan',
            ], 400);
        }

        // Check for existing cancel request
        $existingRequest = CancelRequest::where('order_id', $order->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Sudah ada permintaan pembatalan yang pending untuk pesanan ini',
            ], 400);
        }

        // Calculate refund amount
        $refundAmount = $order->payment_status->value === 'paid' ? $order->total_price : 0;

        // Create cancel request
        $cancelRequest = CancelRequest::create([
            'uuid' => NumberGenerator::uuid(),
            'request_number' => NumberGenerator::cancelRequestNumber(),
            'order_id' => $order->id,
            'requester_id' => $user->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'refund_amount' => $refundAmount,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pembatalan berhasil dikirim',
            'data' => new CancelRequestResource($cancelRequest->load(['order', 'requester'])),
        ], 201);
    }

    /**
     * Display the specified cancel request.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $cancelRequest = CancelRequest::with(['order', 'requester'])
            ->where('uuid', $id)
            ->firstOrFail();

        // Check access
        $user = $request->user();
        $order = $cancelRequest->order;
        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke permintaan ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new CancelRequestResource($cancelRequest),
        ]);
    }

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    /**
     * Get all cancel requests (Admin).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = CancelRequest::with(['order.product', 'requester']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $requests = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CancelRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
                'counts' => [
                    'pending' => CancelRequest::where('status', 'pending')->count(),
                    'approved' => CancelRequest::where('status', 'approved')->count(),
                    'rejected' => CancelRequest::where('status', 'rejected')->count(),
                ],
            ],
        ]);
    }

    /**
     * Approve cancel request (Admin).
     */
    public function approve(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'adminNotes' => 'nullable|string|max:500',
            'refundAmount' => 'nullable|integer|min:0',
        ]);

        $cancelRequest = CancelRequest::where('uuid', $id)->firstOrFail();

        if (!$cancelRequest->canBeProcessed()) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan tidak dapat diproses',
            ], 400);
        }

        $refundAmount = $request->refundAmount 
            ? $request->refundAmount * 100 
            : $cancelRequest->order->total_price;

        $cancelRequest->approve($refundAmount, $request->adminNotes);

        // Cancel the order
        $order = $cancelRequest->order;
        $order->cancel('Cancelled by admin due to cancel request', $request->user()->id);

        // Restore product stock
        $order->product->increment('stock', $order->quantity);

        // Process refund if paid
        if ($order->payment_status->value === 'paid' && $refundAmount > 0) {
            $buyer = $order->buyer;
            $balanceBefore = $buyer->wallet_balance;
            $buyer->wallet_balance += $refundAmount;
            $buyer->save();

            \App\Models\WalletTransaction::create([
                'uuid' => NumberGenerator::uuid(),
                'user_id' => $buyer->id,
                'type' => 'refund',
                'amount' => $refundAmount,
                'balance_before' => $balanceBefore,
                'balance_after' => $buyer->wallet_balance,
                'description' => 'Refund from approved cancel request ' . $cancelRequest->request_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);

            $cancelRequest->markRefundProcessed();
            $order->update(['payment_status' => 'refunded']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pembatalan disetujui',
            'data' => new CancelRequestResource($cancelRequest->fresh()),
        ]);
    }

    /**
     * Reject cancel request (Admin).
     */
    public function reject(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'rejectionReason' => 'required|string|max:500',
            'adminNotes' => 'nullable|string|max:500',
        ]);

        $cancelRequest = CancelRequest::where('uuid', $id)->firstOrFail();

        if (!$cancelRequest->canBeProcessed()) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan tidak dapat diproses',
            ], 400);
        }

        $cancelRequest->reject($request->rejectionReason, $request->adminNotes);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pembatalan ditolak',
            'data' => new CancelRequestResource($cancelRequest->fresh()),
        ]);
    }
}
