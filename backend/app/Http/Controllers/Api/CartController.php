<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Cart;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    use ApiResponse;

    /**
     * Get user's cart.
     */
    public function index(Request $request): JsonResponse
    {
        $cartItems = Cart::with(['product.category', 'product.images', 'product.seller', 'product.shippingOptions'])
            ->where('user_id', $request->user()->id)
            ->get();

        return $this->success(
            $cartItems->map(function ($item) {
                return [
                    'id' => $item->uuid,
                    'product' => new ProductResource($item->product),
                    'quantity' => $item->quantity,
                    'notes' => $item->notes,
                    'subtotal' => (int) $item->getSubtotal(),
                ];
            }),
            'Cart retrieved',
            200
        );
    }

    /**
     * Add to cart.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'productId' => 'required|exists:products,uuid',
            'quantity' => 'integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::where('uuid', $request->productId)->firstOrFail();
        $requestedQuantity = $request->quantity ?? 1;

        $cart = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cart) {
            $addedQuantity = $requestedQuantity;
            $newQuantity = $cart->quantity + $addedQuantity;

            if ($newQuantity > ($product->stock + $cart->quantity)) {
                return $this->error(
                    'Stok tidak mencukupi. Anda sudah memiliki ' . $cart->quantity . ' item di keranjang.',
                    [
                        'current_cart_quantity' => $cart->quantity,
                        'max_stock' => $product->stock + $cart->quantity,
                    ],
                    400
                );
            }

            // Deduct stock
            $product->updateStock($product->stock - $addedQuantity);

            $cart->update([
                'quantity' => $newQuantity,
                'notes' => $request->notes ?? $cart->notes,
            ]);
        } else {
            if ($requestedQuantity > $product->stock) {
                return $this->error('Stok tidak mencukupi', null, 400);
            }

            // Deduct stock
            $product->updateStock($product->stock - $requestedQuantity);

            Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'quantity' => $requestedQuantity,
                'notes' => $request->notes,
            ]);
        }

        return $this->success(null, 'Produk ditambahkan ke keranjang', 201);
    }

    /**
     * Update cart item quantity.
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $product = $cartItem->product;
        $oldQuantity = $cartItem->quantity;
        $newQuantity = $request->quantity;
        $diff = $newQuantity - $oldQuantity;

        // Available stock = current stock + old quantity in cart (stock was deducted when added)
        $availableStock = $product->stock + $oldQuantity;
        if ($newQuantity > $availableStock) {
            return $this->error('Stok tidak mencukupi', null, 400);
        }

        // Adjust stock: deduct if quantity increases, refund if decreases
        $product->updateStock($product->stock - $diff);

        $cartItem->update(['quantity' => $newQuantity]);

        return $this->success([
            'id' => $cartItem->uuid,
            'quantity' => $cartItem->quantity,
            'subtotal' => (int) $cartItem->getSubtotal(),
        ], 'Keranjang diperbarui');
    }

    /**
     * Remove item from cart.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $cartItem = Cart::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $product = $cartItem->product;

        // Refund stock
        if ($product) {
            $product->updateStock($product->stock + $cartItem->quantity);
        }

        $cartItem->delete();

        return $this->success(null, 'Produk dihapus dari keranjang');
    }

    /**
     * Clear entire cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cartItems = Cart::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        // Refund stock for all items
        foreach ($cartItems as $item) {
            if ($item->product) {
                $item->product->updateStock($item->product->stock + $item->quantity);
            }
        }

        Cart::where('user_id', $request->user()->id)->delete();

        return $this->success(null, 'Keranjang dikosongkan');
    }
}
