"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DetailShareDialog from "@/components/pages/guest/shared/DetailShareDialog";
import { addFavorite, removeFavorite, checkFavorite } from "@/lib/api/products";
import { Calendar, Clock, Eye, Flag, Heart, MapPin, MessageCircle, Phone, Share2, Shield, Star, Truck, User, ShoppingCart, Loader2 } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { addToCart } from "@/lib/api/cart";
import { useCartStore } from "@/lib/cart-store";
import { useFavoritesStore } from "@/lib/favorites-store";
import { getEcho } from "@/lib/echo";
import { useAppToast } from "@/hooks/use-app-toast";

interface ProductSeller {
  id: string;
  name: string;
  isVerified?: boolean;
  avatar?: string;
  phone?: string;
  facultyCode?: string;
  facultyName?: string;
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
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego"; sellerId?: string }) => void;
  onOpenReport: () => void;
  currentUser?: any;
}

export default function ProductDetailSidebar({
  product,
  quantity,
  setQuantity,
  formatPrice,
  onAction,
  onNavigate,
  onOpenReport,
  currentUser,
}: ProductDetailSidebarProps) {
  const { success, error: toastError } = useAppToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [showErrorAnim, setShowErrorAnim] = useState(false);
  const [liveRating, setLiveRating] = useState(product.rating || 0);

  // Listen to realtime review updates
  useEffect(() => {
    if (!product?.id) return;

    setLiveRating(product.rating || 0);

    const channel = getEcho().channel(`product.${product.id}`);
    channel.listen('.NewReviewCreated', (event: any) => {
      if (event.stats && event.stats.averageRating !== undefined) {
        setLiveRating(event.stats.averageRating);
      }
    });

    return () => {
      getEcho().leaveChannel(`product.${product.id}`);
    };
  }, [product?.id, product?.rating]);

  const productShareUrl = `https://kampusmarket.id/p/${product.id}`;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const { isFavorited: status } = await checkFavorite(product.id);
        setIsFavorited(status);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };
    checkFavoriteStatus();
  }, [product.id]);

  const toggleFavorite = async () => {
    if (isLoadingFavorite) return;

    try {
      setIsLoadingFavorite(true);
      if (isFavorited) {
        await removeFavorite(product.id);
        setIsFavorited(false);
        success("Dihapus dari favorit", `${product.title} telah dihapus dari favorit.`);
      } else {
        await addFavorite(product.id);
        setIsFavorited(true);
        success("Berhasil ditambahkan ke favorit", `${product.title} telah masuk ke favorit.`);
      }
      void useFavoritesStore.getState().fetchCount();
    } catch (err: any) {
      console.error("Failed to toggle favorite:", err);
      toastError("Gagal mengubah status favorit", err?.message || "Silakan coba lagi nanti.");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

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

  const handleChatWithSeller = () => {
    onNavigate("chat", { productId: product.id, chatAction: "chat" });
  };

  const handleNegoWithSeller = () => {
    onNavigate("chat", { productId: product.id, chatAction: "nego" });
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      
      useCartStore.getState().fetchCount();

      success(
        "Produk berhasil ditambahkan ke keranjang",
        `${quantity}x ${product.title} telah masuk ke keranjang.`
      );

      setShowSuccessAnim(true);
      setTimeout(() => setShowSuccessAnim(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Silakan coba lagi nanti.";
      
      setShowErrorAnim(true);
      setTimeout(() => setShowErrorAnim(false), 500);

      toastError("Gagal menambah ke keranjang", errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isOwner = currentUser?.id && (currentUser.id === product.sellerId || currentUser.id === product.seller?.id);

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
                <span>{Number(liveRating).toFixed(1)}</span>
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

          {isOwner ? (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-center space-y-3">
              <p className="text-primary-800 dark:text-primary-200 font-medium">Ini adalah produk Anda</p>
              <Button
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => onNavigate("dashboard", "products")}
              >
                Kelola Produk
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 text-center"
                    disabled={product.stock === 0}
                  />
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={product.stock === 0}>+</Button>
                  <span className={`text-sm ${product.stock === 0 ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                    {product.stock === 0 ? "HABIS" : `Stok: ${product.stock}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onAction(() => onNavigate("checkout", product.id))}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "STOK HABIS" : "Beli Sekarang"}
                </Button>
                <Button
                  variant="outline"
                  className={`relative overflow-hidden transition-all ${
                    showSuccessAnim ? "border-green-500 text-green-600 bg-green-50" :
                    showErrorAnim ? "border-red-500 text-red-600 bg-red-50 animate-shake" : ""
                  }`}
                  style={showErrorAnim ? { animation: "shake 0.2s ease-in-out 0s 2" } : {}}
                  onClick={() => onAction(handleAddToCart)}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className={`h-4 w-4 mr-2 ${showSuccessAnim ? "animate-bounce" : ""}`} />
                  )}
                  {showSuccessAnim ? "Ditambahkan!" : showErrorAnim ? "Sudah Maksimal" : "+ Keranjang"}
                </Button>
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-5px); }
                  75% { transform: translateX(5px); }
                }
              `}} />

              {product.canNego && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onAction(handleNegoWithSeller)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ajukan Nego
                </Button>
              )}
            </>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${
                isFavorited
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onAction(toggleFavorite)}
              disabled={isLoadingFavorite}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${
                  isFavorited ? "fill-red-500 text-red-500" : ""
                }`}
              />
              {isLoadingFavorite ? "..." : "Simpan"}
            </Button>
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
              {product.seller.avatar && <AvatarImage src={product.seller.avatar} alt={product.seller.name} />}
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
              <p className="font-bold text-lg">{product.soldCount ?? 0}</p>
              <p className="text-muted-foreground">Terjual</p>
            </div>
            <div>
              <p className="font-bold text-lg flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {Number(liveRating).toFixed(1)}
              </p>
              <p className="text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="font-bold text-lg uppercase">
                {product.seller.facultyCode || product.seller.facultyName || "N/A"}
              </p>
              <p className="text-muted-foreground">Fakultas</p>
            </div>
          </div>

          {isOwner ? (
            <Button variant="outline" className="w-full" onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}>
              <User className="h-4 w-4 mr-2" />
              Lihat Profil
            </Button>
          ) : (
            <>
              {product.canNego ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => openWhatsApp(product.seller.phone, product.seller.name, product.title, false)}>
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}>
                    <User className="h-4 w-4 mr-2" />
                    Lihat Profil
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => onAction(handleChatWithSeller)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}>
                      <User className="h-4 w-4 mr-2" />
                      Lihat Profil
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={() => openWhatsApp(product.seller.phone, product.seller.name, product.title, false)}>
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </>
              )}
            </>
          )}

          {!isOwner && (
            <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onAction(onOpenReport)}>
              <Flag className="h-4 w-4 mr-2" />
              Laporkan Produk
            </Button>
          )}
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
