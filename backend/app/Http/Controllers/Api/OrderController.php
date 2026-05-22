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
use App\Services\MidtransService;
use App\Models\Payment;
use Illuminate\Support\Str;
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

            $query = Order::with(['product.images', 'buyer', 'seller', 'selectedShippingOption']);

            $query->where(function($q) use ($user) {
                $q->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
            });

            // Filter by type (as buyer or seller)
            if ($request->has('as')) {
                if ($request->as === 'seller') {
                    $query->where('seller_id', $user->id);
                } elseif ($request->as === 'buyer') {
                    $query->where('buyer_id', $user->id);
                }
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
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

        $selectedShippingOption = null;
        if ($request->selected_shipping_option_id) {
            $selectedShippingOption = $product->shippingOptions()
                ->where('uuid', $request->selected_shipping_option_id)
                ->first();
        }

        if (!$selectedShippingOption && $request->shippingType) {
            $selectedShippingOption = $product->shippingOptions()
                ->where('type', $request->shippingType)
                ->first();
        }

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

        // Determine initial status based on product type.
        // User requested that ALL orders MUST be confirmed by seller first.
        $initialStatus = OrderStatus::PENDING;

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
            'order_id' => $order->id,
            'status' => $initialStatus->value,
            'notes' => 'Order created',
            'actor_id' => $user->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->seller_id,
            'Pesanan Baru',
            "Anda menerima pesanan baru untuk produk '{$product->title}'.",
            $order->uuid
        );

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

        $shippingFee = (int) $request->shippingFee;

        // Update order
        $order->update([
            'shipping_fee' => $shippingFee,
            'shipping_method' => $request->shippingMethod,
            'total_price' => $order->final_price + $shippingFee,
            'status' => OrderStatus::WAITING_PAYMENT,
        ]);

        // Add history
        OrderHistory::create([
            'order_id' => $order->id,
            'status' => OrderStatus::WAITING_PAYMENT->value,
            'notes' => 'Shipping fee set: Rp ' . number_format($request->shippingFee, 0, ',', '.'),
            'actor_id' => $request->user()->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->buyer_id,
            'Ongkos Kirim Ditetapkan',
            "Penjual telah menetapkan ongkos kirim sebesar Rp " . number_format($request->shippingFee, 0, ',', '.') . " untuk pesanan Anda. Silakan lanjutkan ke pembayaran.",
            $order->uuid
        );

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

        $offeredPrice = (int) $request->offeredPrice;

        $order->update([
            'offered_price' => $offeredPrice,
            'price_offer_notes' => $request->priceOfferNotes,
            'status' => OrderStatus::WAITING_CONFIRMATION,
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => OrderStatus::WAITING_CONFIRMATION->value,
            'notes' => 'Price offered: Rp ' . number_format($request->offeredPrice, 0, ',', '.'),
            'actor_id' => $request->user()->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->buyer_id,
            'Penawaran Harga',
            "Penjual memberikan penawaran harga sebesar Rp " . number_format($request->offeredPrice, 0, ',', '.') . ". Silakan konfirmasi.",
            $order->uuid
        );

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
                    'order_id' => $order->id,
                'status' => $order->fresh()->status->value,
                'notes' => 'Buyer accepted the price offer',
                'actor_id' => $request->user()->id,
            ]);

            \App\Models\Notification::createOrderNotification(
                $order->seller_id,
                'Penawaran Diterima',
                "Pembeli telah menyetujui penawaran harga Anda sebesar Rp " . number_format($newFinalPrice, 0, ',', '.') . ".",
                $order->uuid
            );
        } else {
            // Reject - back to negotiation or cancel
            $order->update([
                'status' => OrderStatus::WAITING_PRICE,
            ]);

            OrderHistory::create([
                    'order_id' => $order->id,
                'status' => OrderStatus::WAITING_PRICE->value,
                'notes' => 'Buyer rejected the price offer',
                'actor_id' => $request->user()->id,
            ]);

            \App\Models\Notification::createOrderNotification(
                $order->seller_id,
                'Penawaran Ditolak',
                "Pembeli menolak penawaran harga Anda. Silakan berikan penawaran baru.",
                $order->uuid
            );
        }

        return response()->json([
            'success' => true,
            'message' => $request->accepted ? 'Harga diterima' : 'Harga ditolak',
            'data' => new OrderResource($order->fresh()),
        ]);
    }

    /**
     * Confirm order (Seller action).
     * COD barang: pending → processing
     * Pickup barang: pending → waiting_payment
     * Jasa (fixed price): pending → waiting_payment
     */
    public function confirm(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        if ($order->seller_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses'], 403);
        }

        if ($order->status !== OrderStatus::PENDING) {
            return response()->json(['success' => false, 'message' => 'Status pesanan tidak valid'], 400);
        }

        $shippingType = $order->shipping_type;
        $product = $order->product;

        // Determine next status after confirmation
        if ($product->type->value === 'jasa' && $product->price_type->value !== 'fixed') {
            // Variable pricing for jasa - need seller to set price
            $newStatus = OrderStatus::WAITING_PRICE;
        } elseif ($shippingType === ShippingType::DELIVERY) {
            // User requested: Manual delivery must always have shipping fee input by seller
            $newStatus = OrderStatus::WAITING_SHIPPING_FEE;
        } elseif ($shippingType === ShippingType::COD) {
            // COD doesn't need payment — go straight to processing
            $newStatus = OrderStatus::PROCESSING;
        } else {
            // Default: waiting for payment
            $newStatus = OrderStatus::WAITING_PAYMENT;
        }

        $order->update(['status' => $newStatus]);

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => $newStatus->value,
            'notes' => 'Pesanan diterima oleh penjual',
            'actor_id' => $request->user()->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->buyer_id,
            'Pesanan Dikonfirmasi',
            "Pesanan Anda untuk '{$product->title}' telah dikonfirmasi oleh penjual.",
            $order->uuid
        );

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dikonfirmasi',
            'data' => new OrderResource($order->fresh()->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
        ]);
    }

    /**
     * Deliver / Service done (Seller action).
     * Marks that seller has shipped/completed their side.
     * Sets auto_confirm_deadline to 3 days from now.
     *
     * Barang delivery: processing → in_delivery
     * Barang pickup: ready_pickup (seller confirms handover, waiting buyer confirm)
     * Barang COD: processing (seller confirms handover, waiting buyer confirm)
     * Jasa: processing (seller confirms service done, waiting buyer confirm)
     */
    public function deliver(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        if ($order->seller_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses'], 403);
        }

        $allowedStatuses = [OrderStatus::PROCESSING, OrderStatus::READY_PICKUP];
        if (!in_array($order->status, $allowedStatuses, true)) {
            return response()->json(['success' => false, 'message' => 'Status pesanan tidak valid'], 400);
        }

        $isService = $order->product_type->value === 'jasa';
        $shippingType = $order->shipping_type;

        // Determine new status
        if (!$isService && $shippingType === ShippingType::DELIVERY) {
            $newStatus = OrderStatus::IN_DELIVERY;
        } else {
            // For COD, pickup, jasa — stay in same status but seller_confirmed_at is set
            // The buyer must then click "confirm received" to complete
            $newStatus = $order->status;
        }

        $autoConfirmDeadline = now()->addDays(3);

        $order->update([
            'status' => $newStatus,
            'seller_confirmed_at' => now(),
            'auto_confirm_deadline' => $autoConfirmDeadline,
        ]);

        $notes = $isService ? 'Penyedia jasa mengkonfirmasi layanan selesai' : 'Penjual mengkonfirmasi barang diserahkan/dikirim';

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => $newStatus->value,
            'notes' => $notes,
            'actor_id' => $request->user()->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->buyer_id,
            $isService ? 'Layanan Selesai' : 'Pesanan Dikirim',
            $notes . ". Silakan konfirmasi penerimaan pesanan jika sudah sesuai.",
            $order->uuid
        );

        return response()->json([
            'success' => true,
            'message' => $isService ? 'Konfirmasi layanan selesai berhasil' : 'Konfirmasi pengiriman berhasil',
            'data' => new OrderResource($order->fresh()->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
        ]);
    }

    /**
     * Pay for order (Buyer action).
     * ESCROW: Dana ditahan di sistem, TIDAK langsung masuk ke saldo penjual.
     * Penjual baru menerima dana setelah buyer confirm (complete).
     */
    public function pay(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();

        // Override payment_method jika frontend mengirim paymentMethod
        $requestedMethod = $request->input('paymentMethod');
        if ($requestedMethod === 'wallet' || $requestedMethod === 'balance') {
            $order->payment_method = 'balance';
            $order->save();
        } elseif ($requestedMethod === 'midtrans') {
            $order->payment_method = 'midtrans';
            $order->save();
        }

        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses'], 403);
        }

        if ($order->status !== OrderStatus::WAITING_PAYMENT) {
            return response()->json(['success' => false, 'message' => 'Silakan tunggu konfirmasi penjual sebelum melakukan pembayaran'], 400);
        }

        $buyer = $request->user();
        $totalPrice = $order->total_price;

        // Midtrans — return snap token, actual payment handled by webhook
        if ($order->payment_method === 'midtrans') {
            $midtrans = app(MidtransService::class);

            $payment = Payment::create([
                'uuid' => Str::uuid(),
                'order_id' => $order->id,
                'payment_gateway' => 'midtrans',
                'payment_method' => null,
                'transaction_id' => null,
                'gross_amount' => $order->total_price,
                'currency' => 'IDR',
                'status' => 'pending',
            ]);

            $payload = [
                'transaction_details' => [
                    'order_id' => (string) $payment->uuid,
                    'gross_amount' => (int) $payment->gross_amount,
                ],
                'item_details' => [
                    [
                        'id' => (string) $order->product_id,
                        'price' => (int) $order->final_price,
                        'quantity' => $order->quantity,
                        'name' => substr($order->product_title, 0, 50),
                    ],
                ],
                'customer_details' => [
                    'first_name' => $order->buyer?->name ?? 'Buyer',
                    'email' => $order->buyer?->email ?? null,
                ],
            ];

            // Add shipping fee as separate item if exists
            if ($order->shipping_fee > 0) {
                $payload['item_details'][] = [
                    'id' => 'SHIPPING',
                    'price' => (int) $order->shipping_fee,
                    'quantity' => 1,
                    'name' => 'Ongkos Kirim',
                ];
            }

            $result = $midtrans->createSnapToken($payload);
            $payment->raw_response = $result;
            if (isset($result['token'])) {
                $payment->transaction_id = $result['transaction_id'] ?? null;
                $payment->save();
                return response()->json([
                    'success' => true,
                    'message' => 'Snap token created',
                    'data' => [
                        'snap_token' => $result['token'],
                        'payment_uuid' => (string) $payment->uuid,
                    ],
                ]);
            }

            $payment->save();
            Log::error('[OrderController] Midtrans snap token failed', ['result' => $result]);
            return response()->json(['success' => false, 'message' => 'Gagal membuat token pembayaran', 'error' => $result], 500);
        }

        // Balance payment — deduct from buyer, hold in escrow (NOT transferred to seller yet)
        if ($order->payment_method === 'balance') {
            if ($buyer->wallet_balance < $totalPrice) {
                return response()->json(['success' => false, 'message' => 'Saldo tidak mencukupi'], 400);
            }

            $balanceBefore = $buyer->wallet_balance;
            $buyer->wallet_balance -= $totalPrice;
            $buyer->save();

            WalletTransaction::create([
                    'user_id' => $buyer->id,
                'type' => 'payment',
                'amount' => -$totalPrice,
                'balance_before' => $balanceBefore,
                'balance_after' => $buyer->wallet_balance,
                'description' => 'Pembayaran pesanan ' . $order->order_number . ' (escrow)',
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);
        }

        // Update order status — dana di escrow, penjual belum terima
        $newStatus = match ($order->shipping_type) {
            ShippingType::PICKUP => OrderStatus::READY_PICKUP,
            ShippingType::DELIVERY => OrderStatus::PROCESSING,
            default => OrderStatus::PROCESSING,
        };

        $order->update([
            'status' => $newStatus,
            'payment_status' => PaymentStatus::PAID,
            'paid_at' => now(),
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => $newStatus->value,
            'notes' => 'Pembayaran berhasil — dana ditahan di escrow',
            'actor_id' => $request->user()->id,
        ]);

        \App\Models\Notification::createOrderNotification(
            $order->seller_id,
            'Pembayaran Berhasil',
            "Pembayaran dari pembeli untuk pesanan '{$order->product_title}' telah berhasil (ditahan di escrow sistem). Silakan proses pesanan.",
            $order->uuid
        );

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil',
            'data' => new OrderResource($order->fresh()->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
        ]);
    }

    /**
     * Complete order (Buyer confirms receipt).
     * ESCROW RELEASE: Dana diteruskan ke saldo penjual, dipotong admin fee 5%.
     * Hanya buyer yang boleh complete. Seller pakai deliver().
     */
    public function complete(string $id, Request $request): JsonResponse
    {
        $order = Order::where('uuid', $id)->firstOrFail();
        $user = $request->user();

        // Only buyer can complete
        if ($order->buyer_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Hanya pembeli yang dapat mengkonfirmasi pesanan selesai'], 403);
        }

        // Must be in a completable state (seller has delivered/confirmed)
        $completableStatuses = [OrderStatus::PROCESSING, OrderStatus::IN_DELIVERY, OrderStatus::READY_PICKUP];
        if (!in_array($order->status, $completableStatuses, true)) {
            return response()->json(['success' => false, 'message' => 'Status pesanan tidak valid untuk konfirmasi'], 400);
        }

        // Mark as completed
        $order->update([
            'status' => OrderStatus::COMPLETED,
            'completed_at' => now(),
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'status' => OrderStatus::COMPLETED->value,
            'notes' => 'Pembeli mengkonfirmasi pesanan selesai',
            'actor_id' => $user->id,
        ]);

        // Update product sold count
        $order->product->incrementSoldCount($order->quantity);

        // ESCROW RELEASE: Transfer dana ke penjual (hanya untuk pembayaran digital, bukan COD)
        if ($order->payment_status === PaymentStatus::PAID) {
            $seller = $order->seller;
            $sellerBalanceBefore = $seller->wallet_balance;
            $seller->wallet_balance += $order->net_income;
            $seller->save();

            WalletTransaction::create([
                    'user_id' => $seller->id,
                'type' => 'income',
                'amount' => $order->net_income,
                'balance_before' => $sellerBalanceBefore,
                'balance_after' => $seller->wallet_balance,
                'description' => 'Pencairan escrow pesanan ' . $order->order_number,
                'related_order_id' => $order->id,
                'status' => 'completed',
            ]);

            if ($order->admin_fee_deducted > 0) {
                WalletTransaction::create([
                    'user_id' => $seller->id,
                    'type' => 'admin_fee',
                    'amount' => -$order->admin_fee_deducted,
                    'balance_before' => $sellerBalanceBefore + $order->net_income,
                    'balance_after' => $seller->wallet_balance,
                    'description' => 'Biaya admin (5%) pesanan ' . $order->order_number,
                    'related_order_id' => $order->id,
                    'status' => 'completed',
                ]);
            }
        }

        \App\Models\Notification::createOrderNotification(
            $order->seller_id,
            'Pesanan Selesai',
            "Pembeli telah mengkonfirmasi penerimaan pesanan '{$order->product_title}'. Dana telah diteruskan ke saldo Anda.",
            $order->uuid
        );

        return response()->json([
            'success' => true,
            'message' => 'Pesanan dikonfirmasi selesai',
            'data' => new OrderResource($order->fresh()->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
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

        // Refund if already paid
        if ($order->payment_status === PaymentStatus::PAID) {
            $buyer = $order->buyer;
            $balanceBefore = $buyer->wallet_balance;
            $buyer->wallet_balance += $order->total_price;
            $buyer->save();

            WalletTransaction::create([
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

        $otherPartyId = $user->id === $order->buyer_id ? $order->seller_id : $order->buyer_id;
        $partyRole = $user->id === $order->buyer_id ? 'Pembeli' : 'Penjual';

        \App\Models\Notification::createOrderNotification(
            $otherPartyId,
            'Pesanan Dibatalkan',
            "$partyRole telah membatalkan pesanan '{$order->product_title}' dengan alasan: {$request->cancelReason}",
            $order->uuid
        );

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
