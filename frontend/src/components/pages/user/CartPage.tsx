"use client";

import { useMemo, useState } from "react";
import { mockProducts } from "@/lib/mock-data";
import CartEmptyState from "@/components/pages/user/cart/CartEmptyState";
import CartHeader from "@/components/pages/user/cart/CartHeader";
import CartItemCard from "@/components/pages/user/cart/CartItemCard";
import CartSelectAllCard from "@/components/pages/user/cart/CartSelectAllCard";
import CartSummaryCard from "@/components/pages/user/cart/CartSummaryCard";
import { buildCartProducts, computeSubtotal } from "@/components/pages/user/cart/cart.utils";
import type { CartItem, CartPageProps } from "@/components/pages/user/cart/cart.types";

const initialCartProductIds = ["p1", "p2", "p5"];

export default function CartPage({ onNavigate }: CartPageProps) {
  const [cartProductIds, setCartProductIds] = useState<string[]>(initialCartProductIds);
  const [selectedItems, setSelectedItems] = useState<string[]>(["p1", "p2"]);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    p1: 1,
    p2: 2,
    p5: 1,
  });

  const cartProducts = useMemo(() => buildCartProducts(mockProducts, cartProductIds), [cartProductIds]);

  const cartItems = useMemo<CartItem[]>(
    () => cartProducts.map((product) => ({ product, quantity: quantities[product.id] || 1 })),
    [cartProducts, quantities],
  );

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

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleQuantityInput = (productId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, value),
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCartProductIds((prev) => prev.filter((id) => id !== productId));
    setSelectedItems((prev) => prev.filter((id) => id !== productId));
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <CartHeader itemCount={cartItems.length} onNavigate={onNavigate} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length > 0 && (
              <CartSelectAllCard
                itemCount={cartItems.length}
                selectedCount={selectedItems.length}
                onSelectAll={handleSelectAll}
              />
            )}

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

            {cartItems.length === 0 && <CartEmptyState onNavigate={onNavigate} />}
          </div>

          <div className="space-y-4">
            <CartSummaryCard selectedCount={selectedItems.length} subtotal={subtotal} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
