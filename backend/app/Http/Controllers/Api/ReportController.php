<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Models\Product;
use App\Http\Resources\ReportResource;
use App\Http\Requests\StoreReportRequest;
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
        $query = Report::with(['reporter', 'reportedUser', 'product'])
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

        // Check for duplicate report
        $existingReport = Report::where('reporter_id', $request->user()->id)
            ->where('reported_user_id', $reportedUser->id)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki laporan pending untuk pengguna ini',
            ], 400);
        }

        $product = null;
        if ($request->has('productId')) {
            $product = Product::where('uuid', $request->productId)->first();
        }

        // Create report
        $report = Report::create([
            'uuid' => NumberGenerator::uuid(),
            'report_number' => NumberGenerator::reportNumber(),
            'reporter_id' => $request->user()->id,
            'reported_user_id' => $reportedUser->id,
            'product_id' => $product?->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim',
            'data' => new ReportResource($report->load(['reporter', 'reportedUser', 'product'])),
        ], 201);
    }

    /**
     * Display the specified report.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $report = Report::with(['reporter', 'reportedUser', 'product'])
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
        $query = Report::with(['reportedUser', 'product'])
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
        $query = Report::with(['reporter', 'reportedUser', 'product']);

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
                    'reviewed' => Report::where('status', 'reviewed')->count(),
                    'resolved' => Report::where('status', 'resolved')->count(),
                    'dismissed' => Report::where('status', 'dismissed')->count(),
                ],
            ],
        ]);
    }

    /**
     * Mark report as reviewed (Admin).
     */
    public function review(string $id): JsonResponse
    {
        $report = Report::where('uuid', $id)->firstOrFail();
        $report->markAsReviewed();

        return response()->json([
            'success' => true,
            'message' => 'Laporan ditandai sedang ditinjau',
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

        $report->resolve($request->resolution, $request->adminNotes);

        // Optionally ban user
        if ($request->banUser) {
            $reportedUser = $report->reportedUser;
            $reportedUser->update([
                'is_banned' => true,
                'ban_reason' => $request->banReason,
            ]);
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
