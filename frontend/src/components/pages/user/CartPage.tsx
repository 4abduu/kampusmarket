"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart, updateCart, removeFromCart } from "@/lib/api/cart";
import CartEmptyState from "@/components/pages/user/cart/CartEmptyState";
import CartHeader from "@/components/pages/user/cart/CartHeader";
import CartItemCard from "@/components/pages/user/cart/CartItemCard";
import CartSelectAllCard from "@/components/pages/user/cart/CartSelectAllCard";
import CartSummaryCard from "@/components/pages/user/cart/CartSummaryCard";
import { computeSubtotal } from "@/components/pages/user/cart/cart.utils";
import type { CartItem, CartPageProps } from "@/components/pages/user/cart/cart.types";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { validateMultipleCheckout } from "@/lib/checkout-validation";

export default function CartPage({ onNavigate }: CartPageProps) {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await getCart();
        // data from API is array of { id, product, quantity }
        // our local CartItem is { product, quantity }
        const formattedItems = data.map(item => ({
          id: item.id, // we might need the cart item id for updates
          product: item.product,
          quantity: item.quantity
        }));
        
        setCartItems(formattedItems);
        
        // Auto-select all items by default
        setSelectedItems(formattedItems.map(item => item.product.id));

        // Update global cart store count
        const totalQty = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
        useCartStore.getState().setCount(totalQty);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const subtotal = useMemo(() => computeSubtotal(selectedItems, cartItems), [selectedItems, cartItems]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? cartItems.map((item) => item.product.id) : []);
  };

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, productId]);
      return;
    }

    setSelectedItems((prev) => prev.filter((id) => id !== productId));
  };

  const handleUpdateQuantity = async (productId: string, delta: number) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    
    try {
      // If we have the cart item ID, use it for update
      const cartItemId = (item as any).id;
      if (cartItemId) {
        await updateCart(cartItemId, newQty);
      }
      
      setCartItems(prev => prev.map(i => 
        i.product.id === productId ? { ...i, quantity: newQty } : i
      ));
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const handleQuantityInput = async (productId: string, value: number) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = Math.min(item.product.stock, Math.max(1, value));
    try {
      const cartItemId = (item as any).id;
      if (cartItemId) {
        await updateCart(cartItemId, newQty);
      }
      setCartItems(prev => prev.map(i => 
        i.product.id === productId ? { ...i, quantity: newQty } : i
      ));
      // Update global cart store
      useCartStore.getState().fetchCount();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (!item) return;

    try {
      const cartItemId = (item as any).id;
      if (cartItemId) {
        await removeFromCart(cartItemId);
      }
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
      // Update global cart store
      useCartStore.getState().fetchCount();
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <CartHeader itemCount={cartItems.length} onNavigate={onNavigate} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length > 0 ? (
              <>
                <CartSelectAllCard
                  itemCount={cartItems.length}
                  selectedCount={selectedItems.length}
                  onSelectAll={handleSelectAll}
                />

                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    selected={selectedItems.includes(item.product.id)}
                    onSelectItem={handleSelectItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    onQuantityInput={handleQuantityInput}
                    onRemoveItem={handleRemoveItem}
                    onNavigate={onNavigate}
                  />
                ))}
              </>
            ) : (
              <CartEmptyState onNavigate={onNavigate} />
            )}
          </div>

          <div className="space-y-4">
            <CartSummaryCard
              selectedCount={selectedItems.length}
              subtotal={subtotal}
              onCheckout={() => {
                const checkoutCartItems = cartItems
                  .filter((item) => selectedItems.includes(item.product.id))
                  .map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    product: item.product, // Required for validation
                    cartItemId: item.id,
                  }));
                
                const validation = validateMultipleCheckout(checkoutCartItems as any);
                if (!validation.valid) {
                  toast({
                    title: "Gagal Checkout",
                    description: validation.error,
                    variant: "destructive",
                  });
                  return;
                }

                // Strip the product object back out before storing in localStorage to save space, or just keep it since CheckoutPage needs it.
                // Actually CheckoutPage fetches data anyway, so we just map to productId and quantity.
                const storageItems = checkoutCartItems.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  cartItemId: item.cartItemId
                }));
                localStorage.setItem("checkoutCartItems", JSON.stringify(storageItems));
                onNavigate("checkout");
              }}
              onContinueShopping={() => onNavigate("catalog")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
