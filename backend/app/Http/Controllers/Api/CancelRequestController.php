<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CancelRequest;
use App\Models\Order;
use App\Http\Resources\CancelRequestResource;
use App\Events\CancelRequestCreated;
use App\Http\Requests\ApproveCancelRequestRequest;
use App\Http\Requests\RejectCancelRequestRequest;
use App\Http\Requests\StoreCancelRequestRequest;
use App\Services\CancelRequestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Database\QueryException;

class CancelRequestController extends Controller
{
    public function __construct(private readonly CancelRequestService $cancelRequestService)
    {
    }

    /**
     * Display a listing of cancel requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CancelRequest::with(['order.product', 'order.buyer', 'order.seller', 'requester'])
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

        // Check if order can request cancellation (post-payment)
        if (!$order->canRequestCancel()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat diajukan pembatalan',
            ], 400);
        }

        // The database enforces one cancel request per order, regardless of status.
        $existingRequest = CancelRequest::where('order_id', $order->id)
            ->first();

        if ($existingRequest) {
            $status = $existingRequest->status->value ?? $existingRequest->status;
            $message = $status === 'pending'
                ? 'Sudah ada permintaan pembatalan yang pending untuk pesanan ini'
                : 'Permintaan pembatalan untuk pesanan ini sudah pernah diajukan';

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 400);
        }

        // Calculate refund amount
        $refundAmount = $order->payment_status->value === 'paid' ? $order->total_price : 0;

        try {
            $cancelRequest = CancelRequest::create([
                'request_number' => NumberGenerator::cancelRequestNumber(),
                'order_id' => $order->id,
                'requester_id' => $user->id,
                'reason' => $request->reason,
                'description' => $request->description,
                'refund_amount' => $refundAmount,
                'status' => 'pending',
            ]);
        } catch (QueryException $e) {
            if ((string) $e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'Permintaan pembatalan untuk pesanan ini sudah pernah diajukan',
                ], 400);
            }

            throw $e;
        }

        CancelRequestCreated::dispatch($cancelRequest);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pembatalan berhasil dikirim',
            'data' => new CancelRequestResource($cancelRequest->load(['order.product', 'order.buyer', 'order.seller', 'requester'])),
        ], 201);
    }

    /**
     * Display the specified cancel request.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $cancelRequest = CancelRequest::with(['order.product', 'order.buyer', 'order.seller', 'requester'])
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
        $query = CancelRequest::with(['order.product', 'order.buyer', 'order.seller', 'requester']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $requests = $query->latest()->paginate($perPage);
        $statusCounts = CancelRequest::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereIn('status', ['pending', 'approved', 'rejected'])
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'success' => true,
            'data' => CancelRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
                'counts' => [
                    'pending' => (int) ($statusCounts['pending'] ?? 0),
                    'approved' => (int) ($statusCounts['approved'] ?? 0),
                    'rejected' => (int) ($statusCounts['rejected'] ?? 0),
                ],
            ],
        ]);
    }

    /**
     * Approve cancel request (Admin).
     */
    public function approve(string $id, ApproveCancelRequestRequest $request): JsonResponse
    {
        try {
            $cancelRequest = $this->cancelRequestService->approve(
                $id,
                $request->user()->id,
                $request->refundAmount,
                $request->adminNotes
            );

            return response()->json([
                'success' => true,
                'message' => 'Permintaan pembatalan disetujui',
                'data' => new CancelRequestResource($cancelRequest->fresh(['order.product', 'order.buyer', 'order.seller', 'requester'])),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menyetujui permintaan pembatalan',
            ], $code);
        }
    }

    /**
     * Reject cancel request (Admin).
     */
    public function reject(string $id, RejectCancelRequestRequest $request): JsonResponse
    {
        try {
            $cancelRequest = $this->cancelRequestService->reject(
                $id,
                $request->rejectionReason,
                $request->adminNotes
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Gagal menolak permintaan pembatalan',
            ], $code);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pembatalan ditolak',
            'data' => new CancelRequestResource($cancelRequest->fresh(['order.product', 'order.buyer', 'order.seller', 'requester'])),
        ]);
    }
}
