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
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/users/{id}/products', [UserController::class, 'products']);
Route::get('/users/{id}/reviews', [UserController::class, 'reviews']);

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

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

Route::middleware(['auth:sanctum'])->group(function () {

    // ----------------------------------------
    // AUTH & PROFILE
    // ----------------------------------------

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);

    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/profile/stats', [UserController::class, 'stats']);

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
    Route::delete('/images', [ImageController::class, 'delete']);
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
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);
    Route::post('/orders/{id}/set-shipping-fee', [OrderController::class, 'setShippingFee']);
    Route::post('/orders/{id}/offer-price', [OrderController::class, 'offerPrice']);
    Route::post('/orders/{id}/confirm-price', [OrderController::class, 'confirmPrice']);
    Route::get('/orders/{id}/history', [OrderController::class, 'history']);

    // Payments (create snap token)
    Route::post('/payments/create-snap', [PaymentController::class, 'createSnap']);

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
    Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);
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

    // Dashboard
    Route::get('/stats', [UserController::class, 'adminStats']);

    // Faculties Management
    Route::get('/faculties', [FacultyController::class, 'adminIndex']);
    Route::post('/faculties', [FacultyController::class, 'store']);
    Route::put('/faculties/{code}', [FacultyController::class, 'update']);
    Route::put('/faculties/{code}/status', [FacultyController::class, 'updateStatus']);
    Route::delete('/faculties/{code}', [FacultyController::class, 'destroy']);

    // User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/ban', [UserController::class, 'ban']);
    Route::put('/users/{id}/unban', [UserController::class, 'unban']);
    Route::put('/users/{id}/warn', [UserController::class, 'warn']);
    Route::put('/users/{id}/verify', [UserController::class, 'verify']);

    // Reports Management
    Route::get('/reports', [ReportController::class, 'adminIndex']);
    Route::put('/reports/{id}/review', [ReportController::class, 'review']);
    Route::put('/reports/{id}/resolve', [ReportController::class, 'resolve']);
    Route::put('/reports/{id}/dismiss', [ReportController::class, 'dismiss']);

    // Cancel Requests Management
    Route::get('/cancel-requests', [CancelRequestController::class, 'adminIndex']);
    Route::put('/cancel-requests/{id}/approve', [CancelRequestController::class, 'approve']);
    Route::put('/cancel-requests/{id}/reject', [CancelRequestController::class, 'reject']);

    // Withdrawals Management
    Route::get('/withdrawals', [WalletController::class, 'adminWithdrawals']);
    Route::put('/withdrawals/{id}/approve', [WalletController::class, 'approveWithdrawal']);
    Route::put('/withdrawals/{id}/process', [WalletController::class, 'processWithdrawal']);
    Route::put('/withdrawals/{id}/reject', [WalletController::class, 'rejectWithdrawal']);
    Route::put('/withdrawals/{id}/fail', [WalletController::class, 'failWithdrawal']);
    Route::put('/withdrawals/{id}/complete', [WalletController::class, 'completeWithdrawal']);
});

// Public webhook endpoint for Midtrans notifications
Route::post('/payments/midtrans/webhook', [PaymentController::class, 'webhook']);
