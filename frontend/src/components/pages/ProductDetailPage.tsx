"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  MapPin,
  Package,
  MessageCircle,
  Phone,
  Share2,
  Heart,
  Shield,
  Truck,
  User,
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";
import { mockProducts } from "@/lib/mock-data";

interface ProductDetailPageProps {
  onNavigate: (page: string, productId?: string) => void;
  productId: string;
  isLoggedIn: boolean;
  onLogin: (role?: "user" | "admin") => void;
}

export default function ProductDetailPage({
  onNavigate,
  productId,
  isLoggedIn,
  onLogin,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [negoPrice, setNegoPrice] = useState("");

  // Find product by ID (using first product as default for demo)
  const product = mockProducts.find((p) => p.id === productId) || mockProducts[0];

  const handleAction = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      {/* Login Required Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Diperlukan</DialogTitle>
            <DialogDescription>
              Kamu harus login terlebih dahulu untuk melakukan tindakan ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              Batal
            </Button>
            <Button onClick={() => onNavigate("login")} className="bg-primary-600 hover:bg-primary-700">
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => onNavigate("landing")}
            className="hover:text-primary-600"
          >
            Beranda
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate("catalog")}
            className="hover:text-primary-600"
          >
            Katalog
          </button>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="relative bg-slate-100 dark:bg-slate-800 h-96 flex items-center justify-center">
                <Package className="h-32 w-32 text-muted-foreground/30" />

                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                  disabled={selectedImage === product.images.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Condition Badge */}
                {product.condition === "baru" ? (
                  <Badge className="absolute top-4 left-4 bg-primary-500">Baru</Badge>
                ) : (
                  <Badge className="absolute top-4 left-4" variant="secondary">Bekas</Badge>
                )}

                {/* Discount Badge */}
                {product.originalPrice && (
                  <Badge className="absolute top-4 right-4 bg-red-500">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-colors ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <div className="bg-slate-100 dark:bg-slate-800 w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </button>
              ))}
            </div>

            {/* Product Info Tabs */}
            <Card>
              <Tabs defaultValue="description">
                <CardHeader className="pb-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="description" className="flex-1">
                      Deskripsi
                    </TabsTrigger>
                    <TabsTrigger value="shipping" className="flex-1">
                      Pengiriman
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1">
                      Ulasan
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="description" className="mt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{product.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="shipping" className="mt-0">
                    <div className="space-y-4">
                      {product.shippingOptions?.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            {option.type === "gratis" ? (
                              <Badge className="bg-primary-500">GRATIS</Badge>
                            ) : option.type === "pickup" ? (
                              <Truck className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Truck className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">{option.label}</p>
                              {option.type === "delivery" && option.priceMax && (
                                <p className="text-sm text-muted-foreground">
                                  Estimasi ongkir: Rp {option.price.toLocaleString("id-ID")} - Rp {option.priceMax.toLocaleString("id-ID")}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-medium">
                            {option.price === 0 ? "Gratis" : `Rp ${option.price.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0">
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                                U{i + 1}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">User {i + 1}</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= 4 - i
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Barang sesuai deskripsi, pengiriman cepat. Recommended seller!
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Purchase Info */}
          <div className="space-y-4">
            {/* Product Card */}
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
                    <span className="text-3xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.canNego && (
                    <Badge variant="outline" className="mt-2">
                      Bisa Nego
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="bg-primary-600 hover:bg-primary-700"
                    onClick={() => handleAction(() => onNavigate("checkout", product.id))}
                  >
                    Beli Sekarang
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(() => onNavigate("cart"))}
                  >
                    + Keranjang
                  </Button>
                </div>

                {/* Negosiasi */}
                {product.canNego && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (!isLoggedIn) setShowLoginModal(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ajukan Nego
                      </Button>
                    </DialogTrigger>
                    {isLoggedIn && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajukan Negosiasi Harga</DialogTitle>
                          <DialogDescription>
                            Masukkan harga penawaranmu untuk produk ini
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Harga Penawaran</Label>
                            <Input
                              type="number"
                              placeholder={formatPrice(product.price)}
                              value={negoPrice}
                              onChange={(e) => setNegoPrice(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Pesan (Opsional)</Label>
                            <Textarea placeholder="Tambahkan pesan untuk penjual..." />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            className="bg-primary-600 hover:bg-primary-700"
                            onClick={() => onNavigate("chat")}
                          >
                            Kirim Penawaran
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Heart className="h-4 w-4 mr-1" />
                    Simpan
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Bagikan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
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
                  <Button
                    variant="outline"
                    onClick={() => handleAction(() => onNavigate("chat"))}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("profile", product.sellerId || product.seller.id)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Lihat Profil
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleAction(() => {})}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Laporkan Produk
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badges */}
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
        </div>
      </div>
    </div>
  );
}
