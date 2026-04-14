"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DetailShareDialog from "@/components/pages/guest/shared/DetailShareDialog";
import {
  Calendar,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Shield,
  Star,
  Truck,
  User,
} from "lucide-react";

interface ProductSeller {
  id: string;
  name: string;
  isVerified?: boolean;
}

interface ProductShape {
  id: string;
  title: string;
  rating: number;
  views?: number;
  createdAt: string;
  price: number;
  originalPrice?: number;
  canNego?: boolean;
  stock: number;
  soldCount?: number;
  location?: string;
  sellerId?: string;
  seller: ProductSeller;
}

interface ProductDetailSidebarProps {
  product: ProductShape;
  quantity: number;
  setQuantity: (value: number) => void;
  formatPrice: (price: number) => string;
  onAction: (action: () => void) => void;
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego" }) => void;
  onOpenReport: () => void;
}

export default function ProductDetailSidebar({
  product,
  quantity,
  setQuantity,
  formatPrice,
  onAction,
  onNavigate,
  onOpenReport,
}: ProductDetailSidebarProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const productShareUrl = `https://kampusmarket.id/p/${product.id}`;

  const handleCopyProductLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(productShareUrl);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <DetailShareDialog
        open={showShareModal}
        onOpenChange={(open) => {
          setShowShareModal(open);
          if (!open) setIsCopied(false);
        }}
        shareUrl={productShareUrl}
        isCopied={isCopied}
        onCopy={handleCopyProductLink}
        title="Bagikan Produk"
        description="Bagikan produk ini ke:"
        inputAriaLabel="Link produk"
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{product.views} dilihat</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{product.createdAt}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {product.canNego && <Badge variant="outline" className="mt-2">Bisa Nego</Badge>}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Jumlah</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 text-center"
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</Button>
              <span className="text-sm text-muted-foreground">Stok: {product.stock}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onAction(() => onNavigate("checkout", product.id))}>
              Beli Sekarang
            </Button>
            <Button variant="outline" onClick={() => onAction(() => onNavigate("cart"))}>+ Keranjang</Button>
          </div>

          {product.canNego && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onAction(() => onNavigate("chat", { productId: product.id, chatAction: "nego" }))}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ajukan Nego
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1"><Heart className="h-4 w-4 mr-1" />Simpan</Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4 mr-1" />
              Bagikan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div
            className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {product.seller.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium hover:text-primary-600">{product.seller.name}</p>
                {product.seller.isVerified && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1 text-primary-600" />
                    Terverifikasi
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {product.location}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
            <div>
              <p className="font-bold text-lg">{product.soldCount}</p>
              <p className="text-muted-foreground">Terjual</p>
            </div>
            <div>
              <p className="font-bold text-lg flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {product.rating}
              </p>
              <p className="text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="font-bold text-lg">4.8</p>
              <p className="text-muted-foreground">Respon</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onAction(() => onNavigate("chat", { productId: product.id, chatAction: "chat" }))}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}>
              <User className="h-4 w-4 mr-2" />
              Lihat Profil
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onAction(onOpenReport)}>
            <Flag className="h-4 w-4 mr-2" />
            Laporkan Produk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <span className="text-sm">Pembayaran Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-600" />
              <span className="text-sm">Pengiriman Fleksibel</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              <span className="text-sm">Penjual Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <span className="text-sm">Respon Cepat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
