<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use App\Models\Faculty;
use App\Models\Report;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Admin Dashboard Controller
 * Menyediakan overview dan statistik umum untuk dashboard admin
 */
class AdminDashboardController extends Controller
{
    /**
     * Get overall dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            // User Statistics
            $totalUsers = User::where('role', 'user')->count();
            $newUsers = User::where('role', 'user')
                ->where('created_at', '>=', now()->subDays(30))
                ->count();
            $bannedUsers = User::where('role', 'user')->where('is_banned', true)->count();
            $sellers = User::where('role', 'user')
                ->whereHas('products')
                ->distinct()
                ->count('id');

            // Product Statistics
            $totalProducts = Product::count();
            $activeProducts = Product::where('status', 'active')->count();
            $draftProducts = Product::where('status', 'draft')->count();
            $barangCount = Product::where('type', 'barang')->count();
            $jasaCount = Product::where('type', 'jasa')->count();

            // Order Statistics
            $totalOrders = Order::count();
            $pendingOrders = Order::whereIn('status', ['pending', 'confirmed'])->count();
            $completedOrders = Order::where('status', 'completed')->count();
            $totalRevenue = Order::where('status', 'completed')
                ->sum(DB::raw('total_price + admin_fee_deducted'));
            $platformRevenue = Order::where('status', 'completed')
                ->sum('admin_fee_deducted');

            // Category Statistics
            $totalCategories = Category::count();
            $barangCategories = Category::where('type', 'barang')->count();
            $jasaCategories = Category::where('type', 'jasa')->count();

            // Faculty Statistics
            $totalFaculties = Faculty::count();
            $activeFaculties = Faculty::where('is_active', true)->count();

            // Report Statistics
            $totalReports = Report::count();
            $pendingReports = Report::where('status', 'pending')->count();
            $resolvedReports = Report::where('status', 'resolved')->count();

            // Withdrawal Statistics
            $totalWithdrawals = Withdrawal::count();
            $pendingWithdrawals = Withdrawal::whereIn('status', ['pending', 'processing'])->count();
            $approvedWithdrawals = Withdrawal::where('status', 'completed')->count();
            $totalWithdrawn = Withdrawal::where('status', 'completed')
                ->sum('amount');

            // Top Products by views
            $topProducts = Product::orderBy('views', 'desc')
                ->limit(5)
                ->get(['uuid', 'title', 'views', 'sold_count'])
                ->toArray();

            // Top Sellers
            $topSellers = User::with('faculty')
                ->whereHas('products')
                ->withCount('products')
                ->orderBy('products_count', 'desc')
                ->limit(10)
                ->get(['id', 'uuid', 'name', 'email', 'faculty_id', 'products_count'])
                ->toArray();

            Log::info('[AdminDashboardController] Dashboard stats retrieved');

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [
                        'total' => $totalUsers,
                        'new_this_month' => $newUsers,
                        'banned' => $bannedUsers,
                        'sellers' => $sellers,
                    ],
                    'products' => [
                        'total' => $totalProducts,
                        'active' => $activeProducts,
                        'draft' => $draftProducts,
                        'barang' => $barangCount,
                        'jasa' => $jasaCount,
                    ],
                    'orders' => [
                        'total' => $totalOrders,
                        'pending' => $pendingOrders,
                        'completed' => $completedOrders,
                        'total_revenue' => $totalRevenue,
                    ],
                    'platform_revenue' => $platformRevenue,
                    'categories' => [
                        'total' => $totalCategories,
                        'barang' => $barangCategories,
                        'jasa' => $jasaCategories,
                    ],
                    'faculties' => [
                        'total' => $totalFaculties,
                        'active' => $activeFaculties,
                    ],
                    'reports' => [
                        'total' => $totalReports,
                        'pending' => $pendingReports,
                        'resolved' => $resolvedReports,
                    ],
                    'withdrawals' => [
                        'total' => $totalWithdrawals,
                        'pending' => $pendingWithdrawals,
                        'approved' => $approvedWithdrawals,
                        'total_amount' => $totalWithdrawn,
                    ],
                    'top_products' => $topProducts,
                    'top_sellers' => $topSellers,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminDashboardController] Error getting stats', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik dashboard',
            ], 500);
        }
    }

    /**
     * Get revenue statistics over time.
     */
    public function revenueStats(): JsonResponse
    {
        try {
            // Monthly revenue
            $monthlyRevenue = Order::where('status', 'completed')
                ->whereYear('created_at', now()->year)
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->selectRaw('MONTH(created_at) as month')
                ->selectRaw('SUM(total_price + admin_fee_deducted) as revenue')
                ->orderBy('month')
                ->get();

            // Weekly revenue (last 30 days)
            $weeklyRevenue = Order::where('status', 'completed')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->selectRaw('DATE(created_at) as date')
                ->selectRaw('SUM(total_price + admin_fee_deducted) as revenue')
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'monthly' => $monthlyRevenue,
                    'weekly' => $weeklyRevenue,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminDashboardController] Error getting revenue stats', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik pendapatan',
            ], 500);
        }
    }

    /**
     * Get activity log summary.
     */
    public function activitySummary(): JsonResponse
    {
        try {
            // New users this week
            $newUsersThisWeek = User::where('role', 'user')
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            // New products this week
            $newProductsThisWeek = Product::where('created_at', '>=', now()->subDays(7))
                ->count();

            // New orders this week
            $newOrdersThisWeek = Order::where('created_at', '>=', now()->subDays(7))
                ->count();

            // Pending reports
            $pendingReports = Report::where('status', 'pending')->count();

            // Pending withdrawals
            $pendingWithdrawals = Withdrawal::whereIn('status', ['pending', 'processing'])->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'new_users_this_week' => $newUsersThisWeek,
                    'new_products_this_week' => $newProductsThisWeek,
                    'new_orders_this_week' => $newOrdersThisWeek,
                    'pending_reports' => $pendingReports,
                    'pending_withdrawals' => $pendingWithdrawals,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminDashboardController] Error getting activity summary', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil ringkasan aktivitas',
            ], 500);
        }
    }

    /**
     * Get platform revenue details (5% admin fee).
     */
    public function platformRevenue(): JsonResponse
    {
        try {
            $total = Order::where('status', 'completed')
                ->sum('admin_fee_deducted');

            $thisMonth = Order::where('status', 'completed')
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('admin_fee_deducted');

            $lastMonth = Order::where('status', 'completed')
                ->whereYear('created_at', now()->subMonth()->year)
                ->whereMonth('created_at', now()->subMonth()->month)
                ->sum('admin_fee_deducted');

            $pendingClearance = Order::whereIn('status', ['processing', 'ready_pickup', 'in_delivery'])
                ->sum('admin_fee_deducted');

            $transactions = Order::where('status', 'completed')
                ->latest()
                ->limit(50)
                ->get()
                ->map(function ($order) {
                    return [
                        'orderId' => $order->uuid,
                        'orderNumber' => $order->order_number,
                        'productTitle' => $order->product_title,
                        'adminFee' => (int) $order->admin_fee_deducted,
                        'createdAt' => $order->created_at->toDateString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => (int) $total,
                    'thisMonth' => (int) $thisMonth,
                    'lastMonth' => (int) $lastMonth,
                    'pendingClearance' => (int) $pendingClearance,
                    'transactions' => $transactions,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminDashboardController] Error getting platform revenue', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pendapatan platform',
            ], 500);
        }
    }
}
