<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Product;
use App\Models\Address;
use App\Models\WalletTransaction;
use App\Models\User;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\NotificationHelper;
use App\Jobs\ReleaseOrderEscrow;

class OrderController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of orders for current user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

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

            return $this->paginated(
                $orders,
                OrderResource::collection($orders->items()),
                'Orders retrieved'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Failed to retrieve orders', null, $code);
        }
    }

    /**
     * Store a newly created order (checkout).
     * Wrapped in DB::transaction for data consistency.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = DB::transaction(function () use ($request) {
                $user = $request->user();
                $product = Product::where('uuid', $request->productId)->lockForUpdate()->firstOrFail();

                // Validate product availability
                if ($product->status->value !== 'active') {
                    throw new \Exception('Produk tidak tersedia', 400);
                }

                if ($product->stock < $request->quantity) {
                    throw new \Exception('Stok tidak mencukupi', 400);
                }

                // Check if buyer is not the seller
                if ($product->seller_id === $user->id) {
                    throw new \Exception('Anda tidak dapat membeli produk sendiri', 400);
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
                    throw new \Exception('Opsi pengiriman tidak valid untuk produk ini', 400);
                }

                $selectedShippingType = $selectedShippingOption->type->value ?? $selectedShippingOption->type;
                if ($selectedShippingType !== $request->shippingType) {
                    throw new \Exception('Tipe pengiriman tidak sesuai dengan opsi yang dipilih', 400);
                }

                $shippingFee = (int) ($selectedShippingOption->price ?? 0);

                // Determine initial status - ALL orders must be confirmed by seller first
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
                    'payment_method' => $request->paymentMethod ?? ($selectedShippingType === 'cod' ? 'cod' : 'balance'),
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

                NotificationHelper::orderNew($order->seller_id, $order);

                // NOTE: DO NOT increment sold_count here
                // It will be incremented only when order is COMPLETED (complete() method)
                // This prevents double-counting if order is cancelled later

                // Deduct stock for all purchases at checkout
                $product->updateStock($product->stock - $request->quantity);

                $isFromCart = (bool) $request->input('from_cart', false);
                if ($isFromCart) {
                    // From cart: cleanup cart item
                    \App\Models\Cart::where('user_id', $user->id)
                        ->where('product_id', $product->id)
                        ->delete();
                }

                return $order;
            });

            return $this->created(
                new OrderResource($order->load(['product.images', 'buyer', 'seller', 'selectedShippingOption'])),
                'Pesanan berhasil dibuat'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal membuat pesanan', null, $code);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $order = Order::with(['product.images', 'buyer', 'seller', 'history.actor', 'selectedAddress', 'selectedShippingOption', 'reviews'])
                ->where('uuid', $id)
                ->firstOrFail();

            // Check access
            $user = $request->user();
            if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id && !$user->isAdmin()) {
                throw new \Exception('Anda tidak memiliki akses ke pesanan ini', 403);
            }

            return $this->success(
                new OrderResource($order),
                'Order retrieved'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Order not found', null, $code);
        }
    }

    /**
     * Get buyer's orders.
     */
    public function buyerOrders(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['product.images', 'seller', 'selectedShippingOption'])
                ->where('buyer_id', $request->user()->id);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page', 10);
            $orders = $query->latest()->paginate($perPage);

            return $this->paginated(
                $orders,
                OrderResource::collection($orders->items()),
                'Buyer orders retrieved'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Failed to retrieve orders', null, $code);
        }
    }

    /**
     * Get seller's orders.
     */
    public function sellerOrders(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['product.images', 'buyer', 'selectedShippingOption'])
                ->where('seller_id', $request->user()->id);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page', 10);
            $orders = $query->latest()->paginate($perPage);

            return $this->paginated(
                $orders,
                OrderResource::collection($orders->items()),
                'Seller orders retrieved'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Failed to retrieve orders', null, $code);
        }
    }

    /**
     * Set shipping fee (Seller action).
     * Wrapped in DB::transaction for data consistency.
     */
    public function setShippingFee(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'shippingFee' => 'required|integer|min:0',
            'shippingMethod' => 'nullable|string|max:100',
            'shippingNotes' => 'nullable|string|max:500',
        ]);

        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                // Check if seller
                if ($order->seller_id !== $request->user()->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                // Check if status is waiting_shipping_fee
                if ($order->status !== OrderStatus::WAITING_SHIPPING_FEE) {
                    throw new \Exception('Status pesanan tidak valid', 400);
                }

                $shippingFee = (int) $request->shippingFee;

                // Update order
                $order->update([
                    'shipping_fee' => $shippingFee,
                    'shipping_method' => $request->shippingMethod,
                    'shipping_notes' => $request->shippingNotes,
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

                NotificationHelper::shippingFeeSet($order->buyer_id, $order, $request->shippingFee);

                return $order->fresh();
            });

            return $this->success(
                new OrderResource($order),
                'Ongkir berhasil ditetapkan'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal menetapkan ongkir', null, $code);
        }
    }

    /**
     * Offer price (Seller action for variable pricing).
     * Wrapped in DB::transaction for data consistency.
     */
    public function offerPrice(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'offeredPrice' => 'required|integer|min:0',
            'priceOfferNotes' => 'nullable|string|max:500',
        ]);

        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                // Check if seller
                if ($order->seller_id !== $request->user()->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                // Check if status is waiting_price
                if ($order->status !== OrderStatus::WAITING_PRICE) {
                    throw new \Exception('Status pesanan tidak valid', 400);
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

                NotificationHelper::priceOffer($order->buyer_id, $order, $request->offeredPrice);

                return $order->fresh();
            });

            return $this->success(
                new OrderResource($order),
                'Penawaran harga berhasil dikirim'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal mengirim penawaran harga', null, $code);
        }
    }

    /**
     * Confirm price (Buyer action).
     */
    public function confirmPrice(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'accepted' => 'required|boolean',
        ]);

        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                // Check if buyer
                if ($order->buyer_id !== $request->user()->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                // Check if status is waiting_confirmation
                if ($order->status !== OrderStatus::WAITING_CONFIRMATION) {
                    throw new \Exception('Status pesanan tidak valid', 400);
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

                    NotificationHelper::priceOfferAccepted($order->seller_id, $order, $newFinalPrice);
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

                    NotificationHelper::priceOfferRejected($order->seller_id, $order);
                }

                return $order->fresh();
            });

            return $this->success(
                new OrderResource($order),
                $request->accepted ? 'Harga diterima' : 'Harga ditolak'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal memproses konfirmasi harga', null, $code);
        }
    }

    /**
     * Confirm order (Seller action).
     * COD barang: pending → processing
     * Pickup barang: pending → waiting_payment
     * Jasa (fixed price): pending → waiting_payment
     * Wrapped in DB::transaction for data consistency.
     */
    public function confirm(string $id, Request $request): JsonResponse
    {
        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if ($order->seller_id !== $request->user()->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                if ($order->status !== OrderStatus::PENDING) {
                    throw new \Exception('Status pesanan tidak valid', 400);
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

                NotificationHelper::orderConfirmed($order->buyer_id, $order);

                return $order->fresh();
            });

            return $this->success(
                new OrderResource($order->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
                'Pesanan berhasil dikonfirmasi'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal mengkonfirmasi pesanan', null, $code);
        }
    }

    /**
     * Deliver / Service done (Seller action).
     * Marks that seller has shipped/completed their side.
     * Sets auto_confirm_deadline to 3 days from now.
     * Wrapped in DB::transaction for data consistency.
     *
     * Barang delivery: processing → in_delivery
     * Barang pickup: ready_pickup (seller confirms handover, waiting buyer confirm)
     * Barang COD: processing (seller confirms handover, waiting buyer confirm)
     * Jasa: processing (seller confirms service done, waiting buyer confirm)
     */
    public function deliver(string $id, Request $request): JsonResponse
    {
        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if ($order->seller_id !== $request->user()->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                $allowedStatuses = [OrderStatus::PROCESSING, OrderStatus::READY_PICKUP];
                if (!in_array($order->status, $allowedStatuses, true)) {
                    throw new \Exception('Status pesanan tidak valid', 400);
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

                NotificationHelper::orderShipped($order->buyer_id, $order, $isService);

                return $order->fresh();
            });

            $isService = $order->product_type->value === 'jasa';

            return $this->success(
                new OrderResource($order->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
                $isService ? 'Konfirmasi layanan selesai berhasil' : 'Konfirmasi pengiriman berhasil'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal mengkonfirmasi pengiriman', null, $code);
        }
    }

    /**
     * Pay for order (Buyer action).
     * ESCROW: Dana ditahan di sistem, TIDAK langsung masuk ke saldo penjual.
     * Penjual baru menerima dana setelah buyer confirm (complete).
     * Wrapped in DB::transaction for consistency.
     */
    public function pay(string $id, Request $request): JsonResponse
    {
        try {
            $result = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();
                $buyer = $request->user();

                // Override payment_method jika frontend mengirim paymentMethod
                $requestedMethod = $request->input('paymentMethod');
                if ($requestedMethod === 'wallet' || $requestedMethod === 'balance') {
                    $order->payment_method = 'balance';
                    $order->save();
                } elseif ($requestedMethod === 'midtrans') {
                    $order->payment_method = 'midtrans';
                    $order->save();
                }

                if ($order->buyer_id !== $buyer->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                if ($order->status !== OrderStatus::WAITING_PAYMENT) {
                    throw new \Exception('Silakan tunggu konfirmasi penjual sebelum melakukan pembayaran', 400);
                }

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
                        return [
                            'type' => 'midtrans',
                            'snap_token' => $result['token'],
                            'payment_uuid' => (string) $payment->uuid,
                        ];
                    }

                    $payment->save();
                    Log::error('[OrderController] Midtrans snap token failed', ['result' => $result]);
                    throw new \Exception('Gagal membuat token pembayaran', 500);
                }

                // Balance payment — deduct from buyer, hold in escrow (NOT transferred to seller yet)
                if ($order->payment_method === 'balance') {
                    $buyer = User::where('id', $buyer->id)->lockForUpdate()->firstOrFail();

                    if (!$buyer->wallet_pin) {
                        throw new \Exception('PIN Wallet belum diatur', 400);
                    }
                    if (!\Illuminate\Support\Facades\Hash::check($request->input('wallet_pin'), $buyer->wallet_pin)) {
                        throw new \Exception('PIN Wallet salah', 400);
                    }

                    if ($buyer->wallet_balance < $totalPrice) {
                        throw new \Exception('Saldo tidak mencukupi', 400);
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

NotificationHelper::paymentReceived($order->seller_id, $order);

                return [
                    'type' => 'balance',
                    'order' => $order->fresh()->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption']),
                ];
            });

            if ($result['type'] === 'midtrans') {
                return $this->success([
                    'snap_token' => $result['snap_token'],
                    'payment_uuid' => $result['payment_uuid'],
                ], 'Snap token created');
            }

            return $this->success(
                new OrderResource($result['order']),
                'Pembayaran berhasil'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal memproses pembayaran', null, $code);
        }
    }

    /**
     * Complete order (Buyer confirms receipt).
     * ESCROW RELEASE: Dana diteruskan ke saldo penjual, dipotong admin fee 5%.
     * Hanya buyer yang boleh complete. Seller pakai deliver().
     * Wrapped in DB::transaction for consistency.
     */
    public function complete(string $id, Request $request): JsonResponse
    {
        try {
            $order = DB::transaction(function () use ($id, $request) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();
                $user = $request->user();

                // Only buyer can complete
                if ($order->buyer_id !== $user->id) {
                    throw new \Exception('Hanya pembeli yang dapat mengkonfirmasi pesanan selesai', 403);
                }

                // Must be in a completable state (seller has delivered/confirmed)
                $completableStatuses = [OrderStatus::PROCESSING, OrderStatus::IN_DELIVERY, OrderStatus::READY_PICKUP];
                if (!in_array($order->status, $completableStatuses, true)) {
                    throw new \Exception('Status pesanan tidak valid untuk konfirmasi', 400);
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

                // UPDATE product sold count - ONLY HERE, not in store()
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

                NotificationHelper::orderCompleted($order->seller_id, $order);

                return $order->fresh();
            });

            return $this->success(
                new OrderResource($order->load(['product.images', 'buyer', 'seller', 'history.actor', 'selectedShippingOption'])),
                'Pesanan dikonfirmasi selesai'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal mengkonfirmasi pesanan selesai', null, $code);
        }
    }

    /**
     * Cancel order.
     * Wrapped in DB::transaction for data consistency.
     * IMPORTANT: Refund logic must be correct based on payment status & completion state.
     */
    public function cancel(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'cancelReason' => 'required|string|max:500',
        ]);

        try {
            $user = $request->user();
            $order = DB::transaction(function () use ($id, $request, $user) {
                $order = Order::where('uuid', $id)->lockForUpdate()->firstOrFail();

                if ($order->seller_id !== $user->id && $order->buyer_id !== $user->id) {
                    throw new \Exception('Anda tidak memiliki akses', 403);
                }

                if (!$order->canBeCancelled()) {
                    throw new \Exception('Pesanan tidak dapat dibatalkan', 400);
                }

                $order->cancel($request->cancelReason, $user->id);

                // Handle refund based on payment status
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

                    // IMPORTANT FIX: Only deduct from seller if order was COMPLETED
                    // (meaning escrow was already released to them).
                    // If order is cancelled before completion, seller never received the money,
                    // so we should NOT deduct from them.
                    if ($order->status === OrderStatus::COMPLETED) {
                        $seller = $order->seller;
                        $sellerBalanceBefore = $seller->wallet_balance;
                        $seller->wallet_balance -= $order->net_income;
                        $seller->save();

                        WalletTransaction::create([
                            'user_id' => $seller->id,
                            'type' => 'refund_deduction',
                            'amount' => -$order->net_income,
                            'balance_before' => $sellerBalanceBefore,
                            'balance_after' => $seller->wallet_balance,
                            'description' => 'Refund deduction for cancelled order ' . $order->order_number,
                            'related_order_id' => $order->id,
                            'status' => 'completed',
                        ]);
                    }

                    $order->update(['payment_status' => PaymentStatus::REFUNDED]);
                }

                return $order->fresh();
            });

            $otherPartyId = $user->id === $order->buyer_id ? $order->seller_id : $order->buyer_id;
            $partyRole = $user->id === $order->buyer_id ? 'Pembeli' : 'Penjual';

            NotificationHelper::orderCancelled($otherPartyId, $order, $request->cancelReason, $partyRole);

            return $this->success(
                new OrderResource($order),
                'Pesanan dibatalkan'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Gagal membatalkan pesanan', null, $code);
        }
    }

    /**
     * Get order history.
     */
    public function history(string $id): JsonResponse
    {
        try {
            $order = Order::where('uuid', $id)->firstOrFail();

            $history = $order->history()
                ->with(['actor'])
                ->latest()
                ->get();

            return $this->success(
                \App\Http\Resources\OrderHistoryResource::collection($history),
                'Order history retrieved'
            );
        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return $this->error($e->getMessage() ?: 'Failed to retrieve order history', null, $code);
        }
    }

}
