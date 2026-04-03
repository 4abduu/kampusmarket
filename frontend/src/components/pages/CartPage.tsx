"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Package,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { mockProducts } from "@/lib/mock-data";

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(["p1", "p2"]);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    p1: 1,
    p2: 2,
    p3: 1,
  });

  // Mock cart items
  const cartItems = [
    { product: mockProducts[0], quantity: quantities["p1"] || 1 },
    { product: mockProducts[1], quantity: quantities["p2"] || 1 },
    { product: mockProducts[4], quantity: quantities["p5"] || 1 },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedProducts = cartItems.filter((item) =>
    selectedItems.includes(item.product.id)
  );

  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.product.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, productId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((id) => id !== productId));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("landing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
            <p className="text-muted-foreground">
              {cartItems.length} barang dalam keranjang
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="select-all"
                      checked={selectedItems.length === cartItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="cursor-pointer">
                      Pilih Semua ({cartItems.length} barang)
                    </Label>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cart Item List */}
            {cartItems.map((item) => (
              <Card
                key={item.product.id}
                className={selectedItems.includes(item.product.id) ? "ring-2 ring-primary-500" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Checkbox
                      checked={selectedItems.includes(item.product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.product.id, checked as boolean)
                      }
                    />
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <p
                            className="font-medium hover:text-primary-600 cursor-pointer"
                            onClick={() => onNavigate("product")}
                          >
                            {item.product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">
                                {item.product.seller.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {item.product.seller.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.product.location.split(",")[0]}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-lg font-bold text-primary-600">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantities({
                                ...quantities,
                                [item.product.id]: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-14 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {item.product.canNego && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Bisa Nego
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {cartItems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keranjang Kosong</h3>
                  <p className="text-muted-foreground mb-4">
                    Yuk mulai belanja dan temukan barang menarik!
                  </p>
                  <Button
                    className="bg-primary-600 hover:bg-primary-700"
                    onClick={() => onNavigate("catalog")}
                  >
                    Mulai Belanja
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Harga ({selectedItems.length} barang)
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="text-muted-foreground">Dihitung saat checkout</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(subtotal)}</span>
                </div>

                <Button
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  onClick={() => onNavigate("checkout")}
                >
                  Checkout ({selectedItems.length})
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigate("catalog")}
                >
                  Lanjut Belanja
                </Button>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}

// Label component for checkbox
function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium cursor-pointer ${className || ""}`}>
      {children}
    </label>
  );
}
