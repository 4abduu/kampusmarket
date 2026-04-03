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
  MessageCircle,
  Phone,
  Share2,
  Heart,
  Shield,
  User,
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Calendar,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { mockServices } from "@/lib/mock-data";

interface ServiceDetailPageProps {
  onNavigate: (page: string, serviceId?: string) => void;
  serviceId: string;
}

export default function ServiceDetailPage({ onNavigate, serviceId }: ServiceDetailPageProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  // Find service by ID
  const service = mockServices.find((s) => s.id === serviceId) || mockServices[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fotografi": return "📸";
      case "Pendidikan": return "🎓";
      case "Desain": return "🎨";
      case "Teknisi": return "🔧";
      case "Kecantikan": return "💄";
      default: return "🛠️";
    }
  };

  // Estimasi pengerjaan berdasarkan kategori
  const getEstimasiPengerjaan = (category: string) => {
    switch (category) {
      case "Fotografi": return "1-3 hari";
      case "Pendidikan": return "1-2 jam/sesi";
      case "Desain": return "3-7 hari";
      case "Teknisi": return "1-2 hari";
      case "Kecantikan": return "1-3 jam";
      default: return "Sesuai kesepakatan";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      {/* Offer Modal */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Penawaran</DialogTitle>
            <DialogDescription>
              Masukkan penawaran harga untuk layanan ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Harga Penawaran</Label>
              <Input
                type="number"
                placeholder={`Rentang: ${formatPrice(service.priceMin)} - ${formatPrice(service.priceMax)}`}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Detail Kebutuhan</Label>
              <Textarea
                placeholder="Jelaskan detail kebutuhanmu..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferModal(false)}>
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                setShowOfferModal(false);
                onNavigate("chat");
              }}
            >
              Kirim Penawaran
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
            onClick={() => onNavigate("services")}
            className="hover:text-primary-600"
          >
            Layanan Jasa
          </button>
          <span>/</span>
          <span className="text-foreground">{service.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 h-96 flex items-center justify-center">
                <span className="text-[150px]">{getCategoryIcon(service.category)}</span>

                {/* Category Badge */}
                <Badge className="absolute top-4 left-4 bg-primary-500">
                  {service.category}
                </Badge>
              </div>
            </Card>

            {/* Portfolio Thumbnails */}
            {service.portfolio && service.portfolio.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {service.portfolio.map((_, index) => (
                  <button
                    key={index}
                    className="shrink-0 w-20 h-20 rounded-lg border-2 border-transparent hover:border-primary-300 overflow-hidden transition-colors"
                  >
                    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 w-full h-full flex items-center justify-center">
                      <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Service Info Tabs */}
            <Card>
              <Tabs defaultValue="description">
                <CardHeader className="pb-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="description" className="flex-1">
                      Deskripsi
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="flex-1">
                      Syarat & Ketentuan
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1">
                      Ulasan
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="description" className="mt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{service.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="terms" className="mt-0">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <h4 className="font-medium mb-2">Syarat Pemesanan</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Bayar di muka atau via escrow</li>
                          <li>Komunikasi via chat untuk detail</li>
                          <li>Revisi sesuai kesepakatan</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <h4 className="font-medium mb-2">Kebijakan Pembatalan</h4>
                        <p className="text-sm text-muted-foreground">
                          Pembatalan dapat dilakukan sebelum pengerjaan dimulai dengan pengembalian dana penuh.
                        </p>
                      </div>
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
                                      star <= 5 - i
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pelayanan sangat memuaskan, hasil sesuai ekspektasi. Recommended!
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
            {/* Service Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-xl font-bold mb-2">{service.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{service.rating}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{service.orderCount} pesanan</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{service.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rentang Harga</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-primary-600">
                      {formatPrice(service.priceMin)}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(service.priceMax)}
                    </span>
                  </div>
                  {service.canNego && (
                    <Badge variant="outline" className="mt-2">
                      Harga bisa dinego
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Availability Status Alert */}
                {service.availabilityStatus === "full" && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Tidak Bisa Menerima Order Baru</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Penyedia jasa sedang penuh order. Silakan chat untuk bertanya kapan slot tersedia.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {service.availabilityStatus === "busy" && (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Sedang Sibuk</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Waktu respon mungkin lebih lambat. Silakan chat untuk cek ketersediaan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estimasi Pengerjaan */}
                <div className="space-y-2">
                  <Label>Estimasi Pengerjaan</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <Clock className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">
                      {service.durationIsPlus && service.durationMin
                        ? `${service.durationMin} ${service.durationUnit}+`
                        : service.durationMin && service.durationMax
                        ? `${service.durationMin} - ${service.durationMax} ${service.durationUnit}`
                        : service.durationMin
                        ? `${service.durationMin} ${service.durationUnit}`
                        : getEstimasiPengerjaan(service.category)}
                    </span>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <Separator />

                {/* Actions - Pesan Jasa (checkout), Chat, dan Ajukan Penawaran */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={() => onNavigate("checkout", serviceId)}
                    disabled={service.availabilityStatus === "full"}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {service.availabilityStatus === "full" ? "Slot Penuh" : "Pesan Jasa"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onNavigate("chat")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat Penjual
                  </Button>

                  {service.canNego && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowOfferModal(true)}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Ajukan Penawaran
                    </Button>
                  )}
                </div>

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

            {/* Provider Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {service.provider.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{service.provider.name}</p>
                      {service.provider.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1 text-primary-600" />
                          Terverifikasi
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {service.location}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                  <div>
                    <p className="font-bold text-lg">{service.orderCount}</p>
                    <p className="text-muted-foreground">Pesanan</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {service.rating}
                    </p>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">98%</p>
                    <p className="text-muted-foreground">Respon</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("chat")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Laporkan Layanan
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
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="text-sm">Penyedia Terverifikasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary-600" />
                    <span className="text-sm">Respon Cepat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary-600" />
                    <span className="text-sm">Harga Transparan</span>
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
