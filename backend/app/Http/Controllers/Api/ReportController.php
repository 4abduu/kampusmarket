<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Models\Product;
use App\Http\Resources\ReportResource;
use App\Http\Requests\StoreReportRequest;
use App\Helpers\NotificationHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;

class ReportController extends Controller
{
    /**
     * Display a listing of reports.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::with(['reporter', 'reportedUser', 'product', 'message', 'message.attachments'])
            ->where('reporter_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $reports = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    /**
     * Store a newly created report.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $reportedUser = User::where('uuid', $request->reportedUserId)->firstOrFail();

        // Cannot report yourself
        if ($reportedUser->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat melaporkan diri sendiri',
            ], 400);
        }

        // Check for duplicate report based on type and specific entity
        $query = Report::where('reporter_id', $request->user()->id)
            ->where('reported_user_id', $reportedUser->id)
            ->where('status', 'pending');

        // Scope duplicate check by report type so different contexts don't block each other
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('productId')) {
            $product = Product::where('uuid', $request->productId)->first();
            $query->where('product_id', $product?->id);
        } elseif ($request->has('messageId')) {
            $message = \App\Models\Message::where('uuid', $request->messageId)->first();
            $query->where('message_id', $message?->id);
        } else {
            $query->whereNull('product_id')->whereNull('message_id');
        }

        $existingReport = $query->first();

        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki laporan yang belum diproses untuk konteks yang sama. Silakan tunggu laporan sebelumnya ditinjau terlebih dahulu.',
            ], 400);
        }

        $product = null;
        if ($request->has('productId')) {
            $product = Product::where('uuid', $request->productId)->first();
        }

        $message = null;
        if ($request->has('messageId')) {
            $message = \App\Models\Message::where('uuid', $request->messageId)->first();
        }

        // Create report
        $report = Report::create([
            'report_number' => NumberGenerator::reportNumber(),
            'reporter_id' => $request->user()->id,
            'reported_user_id' => $reportedUser->id,
            'product_id' => $product?->id,
            'message_id' => $message?->id,
            'type' => $request->type,
            'reason' => $request->reason,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'status' => 'pending',
        ]);

        // Notify all admins about the new report (async via queue)
        try {
            // Load relasi yang dibutuhkan NotificationHelper
            $report->loadMissing(['reportedUser', 'product']);

            if ($product) {
                NotificationHelper::adminProductReport($report);
            } else {
                NotificationHelper::adminUserReport($report);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[ReportController] Failed to dispatch admin notification, but report was saved', [
                'report_id' => $report->uuid,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim',
            'data' => new ReportResource($report->load(['reporter', 'reportedUser', 'product', 'message', 'message.attachments'])),
        ], 201);
    }

    /**
     * Display the specified report.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $report = Report::with(['reporter', 'reportedUser', 'product', 'message', 'message.attachments'])
            ->where('uuid', $id)
            ->firstOrFail();

        // Check access
        $user = $request->user();
        if ($report->reporter_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke laporan ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new ReportResource($report),
        ]);
    }

    /**
     * Get my reports.
     */
    public function myReports(Request $request): JsonResponse
    {
        $query = Report::with(['reportedUser', 'product', 'message', 'message.attachments'])
            ->where('reporter_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $reports = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    /**
     * Get all reports (Admin).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Report::with(['reporter', 'reportedUser', 'product', 'message', 'message.attachments']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $perPage = $request->get('per_page', 20);
        $reports = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'total' => $reports->total(),
                'counts' => [
                    'pending' => Report::where('status', 'pending')->count(),
                    'warning' => Report::where('status', 'warning')->count(),
                    'banned' => Report::where('status', 'banned')->count(),
                    'resolved' => Report::where('status', 'resolved')->count(),
                    'dismissed' => Report::where('status', 'dismissed')->count(),
                ],
            ],
        ]);
    }

    /**
     * Mark report as warning (Admin).
     */
    public function review(string $id, Request $request): JsonResponse
    {
        $report = Report::where('uuid', $id)->firstOrFail();
        $report->markAsWarning();

        return response()->json([
            'success' => true,
            'message' => 'Status laporan berhasil diperbarui',
            'data' => new ReportResource($report->fresh()),
        ]);
    }

    /**
     * Resolve report (Admin).
     */
    public function resolve(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'resolution' => 'required|string|max:500',
            'adminNotes' => 'nullable|string|max:500',
            'banUser' => 'boolean',
            'banReason' => 'required_if:banUser,true|string|max:500',
        ]);

        $report = Report::where('uuid', $id)->firstOrFail();

        // Optionally ban user
        if ($request->banUser) {
            $reportedUser = $report->reportedUser;
            $reportedUser->update([
                'is_banned' => true,
                'ban_reason' => $request->banReason,
            ]);
            $report->markAsBanned($request->resolution, $request->adminNotes);
        } else {
            $report->resolve($request->resolution, $request->adminNotes);
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil diselesaikan',
            'data' => new ReportResource($report->fresh()),
        ]);
    }

    /**
     * Dismiss report (Admin).
     */
    public function dismiss(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'adminNotes' => 'nullable|string|max:500',
        ]);

        $report = Report::where('uuid', $id)->firstOrFail();
        $report->dismiss($request->adminNotes);

        return response()->json([
            'success' => true,
            'message' => 'Laporan ditolak',
            'data' => new ReportResource($report->fresh()),
        ]);
    }
}
