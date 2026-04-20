<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Product;
use App\Models\Address;
use App\Models\WalletTransaction;
use App\Http\Resources\OrderResource;
use App\Http\Requests\StoreOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\CurrencyHelper;
use App\Http\Helpers\NumberGenerator;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingType;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for current user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                Log::warning('[OrderController] Unauthorized access attempt');
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            Log::info('[OrderController] Fetching orders for user', [
                'user_id' => $user->id,
                'status' => $request->status,
                'role' => $request->as
            ]);

            $query = Order::with(['product.images', 'buyer', 'seller', 'selectedShippingOption'])
                ->where('buyer_id', $user->id)
                ->orWhere('seller_id', $user->id);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by type (as buyer or seller)
            if ($request->has('as') && $request->as === 'seller') {
                $query->where('seller_id', $user->id);
            } elseif ($request->has('as') && $request->as === 'buyer') {
                $query->where('buyer_id', $user->id);
            }

            $perPage = $request->get('per_page', 10);
            $orders = $query->latest()->paginate($perPage);

            Log::info('[OrderController] Orders fetched successfully', [
                'count' => $orders->total(),
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'data' => OrderResource::collection($orders),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'total' => $orders->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[OrderController] Error fetching orders', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }

    /**
     * Store a newly created order (checkout).
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $product = Product::where('uuid', $request->productId)->firstOrFail();

        // Validate product availability
        if ($product->status->value !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia',
            ], 400);
        }

        if ($product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tidak mencukupi',
            ], 400);
        }

        // Check if buyer is not the seller
        if ($product->seller_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat membeli produk sendiri',
            ], 400);
        }

        // Calculate prices
        $basePrice = $product->price;
        $negoPrice = $request->nego_price ?? null;
        $finalPrice = $negoPrice ?? $basePrice;

        $selectedShippingOption = $product->shippingOptions()
            ->where('uuid', $request->selected_shipping_option_id)
            ->first();

        if (!$selectedShippingOption) {
            return response()->json([
                'success' => false,
                'message' => 'Opsi pengiriman tidak valid untuk produk ini',
            ], 400);
        }

        $selectedShippingType = $selectedShippingOption->type->value ?? $selectedShippingOption->type;
        if ($selectedShippingType !== $request->shippingType) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe pengiriman tidak sesuai dengan opsi yang dipilih',
            ], 400);
        }

        $shippingFee = (int) ($selectedShippingOption->price ?? 0);

        // Determine initial status based on product type
        $initialStatus = OrderStatus::PENDING;

        if ($product->type->value === 'jasa' && $product->price_type->value !== 'fixed') {
            // Variable pricing for jasa - need seller to set price
            $initialStatus = OrderStatus::WAITING_PRICE;
        } elseif ($selectedShippingType === ShippingType::DELIVERY->value && $product->type->value === 'barang' && $shippingFee === 0) {
            // Need seller to set shipping fee
            $initialStatus = OrderStatus::WAITING_SHIPPING_FEE;
        }

        // Get shipping address
        $shippingAddress = null;
        $selectedAddress = null;
        if ($request->selected_address_id) {
            $selectedAddress = Address::where('uuid', $request->selected_address_id)->first();
            if ($selectedAddress) {
                $shippingAddress = $selectedAddress->address;
            }
        }

        // Calculate admin fee and net income
        $adminFeePercent = 5.0;
        $adminFeeDeducted = CurrencyHelper::calculateAdminFee($finalPrice);
        $netIncome = CurrencyHelper::calculateNetIncome($finalPrice);
        $totalPrice = $finalPrice + $shippingFee;

        // Create order
        $order = Order::create([
            'uuid' => NumberGenerator::uuid(),
            'order_number' => NumberGenerator::orderNumber($product->type->value ?? $product->type),
            'product_id' => $product->id,
            'product_title' => $product->title,
            'product_type' => $product->type->value,
            'buyer_id' => $user->id,
            'seller_id' => $product->seller_id,
            'quantity' => $request->quantity,
            'base_price' => $basePrice,
            'nego_price' => $negoPrice,
            'final_price' => $finalPrice,
            'shipping_fee' => $shippingFee,
            'admin_fee_percent' => $adminFeePercent,
            'admin_fee_deducted' => $adminFeeDeducted,
            'total_price' => $totalPrice,
            'net_income' => $netIncome,
            'selected_shipping_option_id' => $selectedShippingOption->id,
            'shipping_type' => $selectedShippingType,
            'shipping_method' => $selectedShippingOption->label,
            'shipping_address' => $shippingAddress,
            'shipping_notes' => $request->shippingNotes,
            'selected_address_id' => $selectedAddress?->id,
            'service_date' => $request->serviceDate,
            'service_time' => $request->serviceTime,
            'service_notes' => $request->serviceNotes,
            'payment_method' => $request->paymentMethod,
            'payment_status' => PaymentStatus::PENDING,
            'status' => $initialStatus,
            'notes' => $request->notes,
        ]);

        // Create order history
        OrderHistory::create([
            'uuid' => NumberGenerator::uuid(),
            'order_id' => $order->id,
            'status' => $initialStatus->value,
            'notes' => 'Order created',
            'actor_id' => $user->id,
        ]);

        // Update product stock
        $product->decrement('stock', $request->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat',
            'data' => new OrderResource($order->load(['product.images', 'buyer', 'seller', 'selectedShippingOption'])),
        ], 201);
    }

    /**
     * Display the specified order.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $order = Order::with(['product.images', 'buyer', 'seller', 'history.actor', 'selectedAddress', 'selectedShippingOption'])
            ->where('uuid', $id)
            ->firstOrFail();

        // Check access
        $user = $request->user();
        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Get buyer's orders.
     */
    public function buyerOrders(Request $request): JsonResponse
    {
        $query = Order::with(['product.images', 'seller', 'selectedShippingOption'])
            ->where('buyer_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get seller's orders.
     */
    public function sellerOrders(Request $request): JsonResponse
    {
        $query = Order::with(['product.images', 'buyer', 'selectedShippingOption'])
            ->where('seller_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Set shipping fee (Seller action).
     */
    public function setShippingFee(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'shippingFee' => 'required|integer|min:0',
            'shippingMethod' => 'nullable|string|max:100',
        ]);

        $order = Order::where('uuid', $id)->firstOrFail();

        // Check if seller
        if ($order->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        // Check if status is waiting_shipping_fee
        if ($order->status !== OrderStatus::WAITING_SHIPPING_FEE) {
            return response()->json([
                'success' => false,
                'message' => 'Status pesanan tidak valid',
            ], 400);
        }

        $shippingFee = $request->shippingFee * 100; // Convert to cent

        // Update order
        $order->update([
            'shipping_fee' => $shippingFee,
            'shipping_method' => $request->shippingMethod,
            'total_price' => $order->final_price + $shippingFee,
            'status' => OrderStatus::WAITING_PAYMENT,
        ]);

        // Add history
        OrderHistory::create([
            'uuid' => NumberGenerator::uuid(),
            'order_id' => $order->id,
            'status' => OrderStatus::WAITING_PAYMENT->value,
            'notes' => 'Shipping fee set: Rp ' . number_format($request->shippingFee, 0, ',', '.'),
            'actor_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ongkir berhasil ditetapkan',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Offer price (Seller action for variable pricing).
     */
    public function offerPrice(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'offeredPrice' => 'required|integer|min:0',
            'priceOfferNotes' => 'nullable|string|max:500',
        ]);

        $order = Order::where('uuid', $id)->firstOrFail();

        // Check if seller
        if ($order->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        // Check if status is waiting_price
        if ($order->status !== OrderStatus::WAITING_PRICE) {
            return response()->json([
                'success' => false,
                'message' => 'Status pesanan tidak valid',
            ], 400);
        }

        $offeredPrice = $request->offeredPrice * 100;

        $order->update([
            'offered_price' => $offeredPrice,
            'price_offer_notes' => $request->priceOfferNotes,
            'status' => OrderStatus::WAITING_CONFIRMATION,
        ]);

        OrderHistory::create([
            'uuid' => NumberGenerator::uuid(),
            'order_id' => $order->id,
            'status' => OrderStatus::WAITING_CONFIRMATION->value,
            'notes' => 'Price offered: Rp ' . number_format($request->offeredPrice, 0, ',', '.'),
            'actor_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penawaran harga berhasil dikirim',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Confirm price (Buyer action).
     */
    public function confirmPrice(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'accepted' => 'required|boolean',
        ]);

        $order = Order::where('uuid', $id)->firstOrFail();

        // Check if buyer
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        // Check if status is waiting_confirmation
        if ($order->status !== OrderStatus::WAITING_CONFIRMATION) {
            return response()->json([
                'success' => false,
                'message' => 'Status pesanan tidak valid',
            ], 400);
        }

        if ($request->accepted) {
            // Update final price
            $newFinalPrice = $order->offered_price;
            $newNetIncome = CurrencyHelper::calculateNetIncome($newFinalPrice);
            $newAdminFee = CurrencyHelper::calculateAdminFee($newFinalPrice);

            $order->update([
                'final_price' => $newFinalPrice,
                'total_price' => $newFinalPrice + $order->shipping_fee,
                'net_income' => $newNetIncome,
                'admin_fee_deducted' => $newAdminFee,
                'status' => $order->shipping_type === ShippingType::DELIVERY
                    ? OrderStatus::WAITING_SHIPPING_FEE 
                    : OrderStatus::WAITING_PAYMENT,
            ]);

            OrderHistory::create([
                'uuid' => NumberGenerator::uuid(),
                'order_id' => $order->id,
                'status' => $order->fresh()->status->value,
                'notes' => 'Buyer accepted the price offer',
                'actor_id' => $request->user()->id,
            ]);
        } else {
            // Reject - back to negotiation or cancel
            $order->update([
                'status' => OrderStatus::WAITING_PRICE,
            ]);

            OrderHistory::create([
                'uuid' => NumberGenerator::uuid(),
                'order_id' => $order->id,
                'status' => OrderStatus::WAITING_PRICE->value,
                'notes' => 'Buyer rejected the price offer',
                'actor_id' => $request->user()->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $request->accepted ? 'Harga diterima' : 'Harga ditolak',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Pay for order (Buyer action).
     */
    public function pay(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        // Check if buyer
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        // Check if status is waiting_payment
        if ($order->status !== OrderStatus::WAITING_PAYMENT) {
            return response()->json([
                'success' => false,
                'message' => 'Status pesanan tidak valid untuk pembayaran',
            ], 400);
        }

        $buyer = $request->user();
        $totalPrice = $order->total_price;

        // Check balance if payment method is balance
        if ($order->payment_method === 'balance') {
            if ($buyer->wallet_balance < $totalPrice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo tidak mencukupi',
                ], 400);
            }

            // Deduct from buyer's wallet
            $balanceBefore = $buyer->wallet_balance;
            $buyer->wallet_balance -= $totalPrice;
            $buyer->save();

            // Create transaction
            WalletTransaction::create([
                'uuid' => NumberGenerator::uuid(),
                'user_id' => $buyer->id,
                'type' => 'payment',
                'amount' => -$totalPrice,
                'balance_before' => $balanceBefore,
                'balance_after' => $buyer->wallet_balance,
                'description' => 'Payment for order ' . $order->order_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);
        }

        // Update order status
        $newStatus = match ($order->shipping_type) {
            ShippingType::GRATIS, ShippingType::PICKUP => OrderStatus::READY_PICKUP,
            ShippingType::COD, ShippingType::ONLINE, ShippingType::ONSITE, ShippingType::HOME_SERVICE => OrderStatus::PROCESSING,
            ShippingType::DELIVERY => OrderStatus::IN_DELIVERY,
            default => OrderStatus::PROCESSING,
        };

        $order->update([
            'status' => $newStatus,
            'payment_status' => PaymentStatus::PAID,
            'paid_at' => now(),
        ]);

        OrderHistory::create([
            'uuid' => NumberGenerator::uuid(),
            'order_id' => $order->id,
            'status' => $newStatus->value,
            'notes' => 'Payment completed',
            'actor_id' => $request->user()->id,
        ]);

        // Add income to seller's wallet (after admin fee)
        $seller = $order->seller;
        $sellerBalanceBefore = $seller->wallet_balance;
        $seller->wallet_balance += $order->net_income;
        $seller->save();

        WalletTransaction::create([
            'uuid' => NumberGenerator::uuid(),
            'user_id' => $seller->id,
            'type' => 'income',
            'amount' => $order->net_income,
            'balance_before' => $sellerBalanceBefore,
            'balance_after' => $seller->wallet_balance,
            'description' => 'Income from order ' . $order->order_number,
            'related_order_id' => $order->id,
            'status' => 'completed',
        ]);

        // Record admin fee
        if ($order->admin_fee_deducted > 0) {
            WalletTransaction::create([
                'uuid' => NumberGenerator::uuid(),
                'user_id' => $seller->id,
                'type' => 'admin_fee',
                'amount' => -$order->admin_fee_deducted,
                'balance_before' => $sellerBalanceBefore + $order->net_income,
                'balance_after' => $seller->wallet_balance,
                'description' => 'Admin fee (5%) for order ' . $order->order_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Complete order.
     */
    public function complete(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        // Check if seller or buyer
        $user = $request->user();
        if ($order->seller_id !== $user->id && $order->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        $order->markAsCompleted();

        // Update product sold count
        $order->product->incrementSoldCount($order->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan selesai',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Cancel order.
     */
    public function cancel(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'cancelReason' => 'required|string|max:500',
        ]);

        $order = Order::where('uuid', $id)->firstOrFail();

        $user = $request->user();
        if ($order->seller_id !== $user->id && $order->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses',
            ], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan',
            ], 400);
        }

        $order->cancel($request->cancelReason, $user->id);

        // Restore product stock
        $order->product->increment('stock', $order->quantity);

        // Refund if already paid
        if ($order->payment_status === PaymentStatus::PAID) {
            $buyer = $order->buyer;
            $balanceBefore = $buyer->wallet_balance;
            $buyer->wallet_balance += $order->total_price;
            $buyer->save();

            WalletTransaction::create([
                'uuid' => NumberGenerator::uuid(),
                'user_id' => $buyer->id,
                'type' => 'refund',
                'amount' => $order->total_price,
                'balance_before' => $balanceBefore,
                'balance_after' => $buyer->wallet_balance,
                'description' => 'Refund for cancelled order ' . $order->order_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);

            // Deduct from seller
            $seller = $order->seller;
            $sellerBalanceBefore = $seller->wallet_balance;
            $seller->wallet_balance -= $order->net_income;
            $seller->save();

            WalletTransaction::create([
                'uuid' => NumberGenerator::uuid(),
                'user_id' => $seller->id,
                'type' => 'payment',
                'amount' => -$order->net_income,
                'balance_before' => $sellerBalanceBefore,
                'balance_after' => $seller->wallet_balance,
                'description' => 'Refund deduction for cancelled order ' . $order->order_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);

            $order->update(['payment_status' => PaymentStatus::REFUNDED]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan dibatalkan',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Get order history.
     */
    public function history(string $id): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        $history = $order->history()
            ->with(['actor'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\OrderHistoryResource::collection($history),
        ]);
    }
}
