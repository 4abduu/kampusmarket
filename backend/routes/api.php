<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CancelRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WalletTopUpController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminFacultyController;
use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| KAMPUSMARKET API ROUTES
|--------------------------------------------------------------------------
|
| Semua route mengembalikan JSON melalui API Resources.
| Format response konsisten: { success, message?, data, meta? }
|
*/

// Laravel Echo + Reverb: daftarkan route untuk otentikasi channel private
// Middleware 'auth:sanctum' memastikan hanya user yang login bisa subscribe ke channel private.
Broadcast::routes(['middleware' => ['auth:sanctum']]);

// ============================================
// HEALTH CHECK
// ============================================

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'KampusMarket API is running',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString(),
    ]);
});

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

// Faculties
Route::get('/faculties', [FacultyController::class, 'index']);
Route::get('/faculties/dropdown', [FacultyController::class, 'dropdown']);
Route::get('/faculties/with-users', [FacultyController::class, 'withUserCount']);
Route::get('/faculties/{code}', [FacultyController::class, 'show']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/type/{type}', [CategoryController::class, 'byType']);
Route::get('/categories/with-products', [CategoryController::class, 'withProductCount']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Products (Public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/category/{category}', [ProductController::class, 'byCategory']);
Route::get('/products/seller/{sellerId}', [ProductController::class, 'bySeller']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Users (Public Profiles)
Route::get('/users/search', [UserController::class, 'search']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/users/{id}/products', [UserController::class, 'products']);
Route::get('/users/{id}/reviews', [UserController::class, 'reviews']);

// Product Reviews (Public)
Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);

// Authentication
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('/auth/google/complete-faculty', [AuthController::class, 'completeGoogleFaculty'])->middleware('auth:sanctum');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/auth/send-email-verification-otp', [AuthController::class, 'sendEmailVerificationOtp']);
Route::post('/auth/verify-email-with-otp', [AuthController::class, 'verifyEmailWithOtp']);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

Route::middleware(['auth:sanctum'])->group(function () {

    // ----------------------------------------
    // AUTH & PROFILE
    // ----------------------------------------

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/check-completion', [AuthController::class, 'checkCompletion']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);

    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/profile/stats', [UserController::class, 'stats']);
    Route::get('/dashboard/stats', [UserController::class, 'dashboardStats']);

    // ----------------------------------------
    // ADDRESSES
    // ----------------------------------------

    Route::apiResource('addresses', AddressController::class);
    Route::get('/addresses/primary', [AddressController::class, 'primary']);
    Route::put('/addresses/{id}/primary', [AddressController::class, 'setPrimary']);

    // ----------------------------------------
    // PRODUCTS (CRUD for Sellers)
    // ----------------------------------------

    Route::get('/my/products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);

    // Image upload (untuk produk baru maupun edit)
    // Simpan lokal di storage/app/public/products/ (jalankan: php artisan storage:link)
    Route::post('/images/upload', [ImageController::class, 'upload']);
    Route::delete('/images/{filename}', [ImageController::class, 'delete']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::put('/products/{id}/status', [ProductController::class, 'updateStatus']);

    // ----------------------------------------
    // CART & FAVORITES
    // ----------------------------------------

    Route::get('/cart', [ProductController::class, 'getCart']);
    Route::post('/cart', [ProductController::class, 'addToCart']);
    Route::put('/cart/{id}', [ProductController::class, 'updateCart']);
    Route::delete('/cart/{id}', [ProductController::class, 'removeFromCart']);
    Route::delete('/cart', [ProductController::class, 'clearCart']);

    Route::get('/favorites', [ProductController::class, 'getFavorites']);
    Route::post('/favorites/{productId}', [ProductController::class, 'addFavorite']);
    Route::delete('/favorites/{productId}', [ProductController::class, 'removeFavorite']);
    Route::get('/favorites/check/{productId}', [ProductController::class, 'checkFavorite']);

    // ----------------------------------------
    // ORDERS
    // ----------------------------------------

    Route::apiResource('orders', OrderController::class)->except(['update']);
    Route::get('/orders/buyer/all', [OrderController::class, 'buyerOrders']);
    Route::get('/orders/seller/all', [OrderController::class, 'sellerOrders']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/complete', [OrderController::class, 'complete']);
    Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
    Route::post('/orders/{id}/deliver', [OrderController::class, 'deliver']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);
    Route::post('/orders/{id}/set-shipping-fee', [OrderController::class, 'setShippingFee']);
    Route::post('/orders/{id}/offer-price', [OrderController::class, 'offerPrice']);
    Route::post('/orders/{id}/confirm-price', [OrderController::class, 'confirmPrice']);
    Route::get('/orders/{id}/history', [OrderController::class, 'history']);

    // Payments (create snap token and confirm payment client-side)
    Route::post('/payments/create-snap', [PaymentController::class, 'createSnap']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirmPayment']);

    // ----------------------------------------
    // CHATS
    // ----------------------------------------

    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'start']);
    Route::get('/chats/unread-count', [ChatController::class, 'unreadCount']);
    Route::get('/chats/{id}', [ChatController::class, 'show']);
    Route::get('/chats/{id}/messages', [ChatController::class, 'messages']);
    Route::get('/chats/{chatId}/messages/{messageId}/attachments', [ChatController::class, 'attachments']);
    Route::post('/chats/{id}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chats/{id}/read', [ChatController::class, 'markAsRead']);
    Route::post('/chats/{id}/typing', [ChatController::class, 'typing']); // [BARU] typing indicator
    Route::post('/chats/{chatId}/messages/{messageId}/accept-offer', [ChatController::class, 'acceptOffer']);
    Route::post('/chats/{chatId}/messages/{messageId}/reject-offer', [ChatController::class, 'rejectOffer']);

    // ----------------------------------------
    // REVIEWS
    // ----------------------------------------

    Route::apiResource('reviews', ReviewController::class);
    Route::post('/reviews/{id}/respond', [ReviewController::class, 'respond']);
    Route::get('/users/{id}/reviews/received', [ReviewController::class, 'receivedReviews']);
    Route::get('/my/reviews/given', [ReviewController::class, 'givenReviews']);

    // ----------------------------------------
    // WALLET
    // ----------------------------------------

    Route::prefix('wallet')->group(function () {
        Route::get('/balance', [WalletController::class, 'balance']);
        Route::get('/transactions', [WalletController::class, 'transactions']);
        Route::post('/top-up', [WalletController::class, 'topUp']);
        Route::post('/withdraw', [WalletController::class, 'withdraw']);
        Route::get('/withdrawals', [WalletController::class, 'withdrawals']);
        Route::get('/withdrawals/{id}', [WalletController::class, 'withdrawalDetail']);

        // Wallet Top-Up via Midtrans
        Route::prefix('topup')->group(function () {
            Route::post('/midtrans/snap', [WalletTopUpController::class, 'createSnap']);
            Route::post('/midtrans/confirm', [WalletTopUpController::class, 'confirmPayment']);
        });
    });

    // ----------------------------------------
    // REPORTS
    // ----------------------------------------

    Route::apiResource('reports', ReportController::class)->except(['update']);
    Route::get('/my/reports', [ReportController::class, 'myReports']);

    // ----------------------------------------
    // CANCEL REQUESTS
    // ----------------------------------------

    Route::apiResource('cancel-requests', CancelRequestController::class)->except(['update']);

    // ----------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});

// ============================================
// ADMIN ROUTES
// ============================================

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {

    // ── DASHBOARD ──────────────────────────────────────────────────────────
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [AdminDashboardController::class, 'revenueStats']);
    Route::get('/dashboard/activity', [AdminDashboardController::class, 'activitySummary']);

    // ── PRODUCTS ───────────────────────────────────────────────────────────
    Route::prefix('products')->group(function () {
        Route::get('/', [AdminProductController::class, 'index']);
        Route::get('/{id}', [AdminProductController::class, 'show']);
        Route::delete('/{id}', [AdminProductController::class, 'destroy']);
        Route::get('/trashed', [AdminProductController::class, 'trashed']);
        Route::post('/{id}/restore', [AdminProductController::class, 'restore']);
        Route::delete('/{id}/force', [AdminProductController::class, 'forceDelete']);
    });

    // ── ORDERS ─────────────────────────────────────────────────────────────
    Route::get('/orders', [AdminOrderController::class, 'index']);

    // ── CATEGORIES ────────────────────────────────────────────────────────
    Route::prefix('categories')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index']);
        Route::post('/', [AdminCategoryController::class, 'store']);
        Route::get('/{id}', [AdminCategoryController::class, 'show']);
        Route::put('/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/{id}', [AdminCategoryController::class, 'destroy']);
        Route::put('/{id}/status', [AdminCategoryController::class, 'updateStatus']);
        Route::get('/stats', [AdminCategoryController::class, 'stats']);
    });

    // ── FACULTIES ──────────────────────────────────────────────────────────
    Route::prefix('faculties')->group(function () {
        Route::get('/', [AdminFacultyController::class, 'index']);
        Route::post('/', [AdminFacultyController::class, 'store']);
        Route::get('/{code}', [AdminFacultyController::class, 'show']);
        Route::put('/{code}', [AdminFacultyController::class, 'update']);
        Route::put('/{code}/status', [AdminFacultyController::class, 'updateStatus']);
        Route::delete('/{code}', [AdminFacultyController::class, 'destroy']);
        Route::get('/stats', [AdminFacultyController::class, 'stats']);
    });

    // ── USERS ──────────────────────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{id}', [AdminUserController::class, 'show']);
        Route::put('/{id}/ban', [AdminUserController::class, 'ban']);
        Route::put('/{id}/unban', [AdminUserController::class, 'unban']);
        Route::put('/{id}/warn', [AdminUserController::class, 'warn']);
        Route::put('/{id}/remove-warning', [AdminUserController::class, 'removeWarning']);
        Route::put('/{id}/verify', [AdminUserController::class, 'verify']);
        Route::get('/stats', [AdminUserController::class, 'stats']);
    });

    Route::get('/addresses', [AdminUserController::class, 'addresses']);

    // ── REPORTS ────────────────────────────────────────────────────────────
    Route::get('/reports', [ReportController::class, 'adminIndex']);
    Route::put('/reports/{id}/review', [ReportController::class, 'review']);
    Route::put('/reports/{id}/resolve', [ReportController::class, 'resolve']);
    Route::put('/reports/{id}/dismiss', [ReportController::class, 'dismiss']);

    // ── CANCEL REQUESTS ────────────────────────────────────────────────────
    Route::get('/cancel-requests', [CancelRequestController::class, 'adminIndex']);
    Route::put('/cancel-requests/{id}/approve', [CancelRequestController::class, 'approve']);
    Route::put('/cancel-requests/{id}/reject', [CancelRequestController::class, 'reject']);

    // ── WITHDRAWALS ────────────────────────────────────────────────────────
    Route::get('/withdrawals', [WalletController::class, 'adminWithdrawals']);
    Route::put('/withdrawals/{id}/approve', [WalletController::class, 'approveWithdrawal']);
    Route::put('/withdrawals/{id}/process', [WalletController::class, 'processWithdrawal']);
    Route::put('/withdrawals/{id}/reject', [WalletController::class, 'rejectWithdrawal']);
    Route::put('/withdrawals/{id}/fail', [WalletController::class, 'failWithdrawal']);
    Route::put('/withdrawals/{id}/complete', [WalletController::class, 'completeWithdrawal']);
});

// Public webhook endpoint for Midtrans notifications
Route::post('/payments/midtrans/webhook', [PaymentController::class, 'webhook']);
Route::post('/wallet/topup/midtrans/webhook', [WalletTopUpController::class, 'webhook']);
