"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DetailShareDialog from "@/components/pages/guest/shared/DetailShareDialog";
import { addFavorite, removeFavorite, checkFavorite } from "@/lib/api/products";
import {
  AlertCircle,
  Calendar,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { getEcho } from "@/lib/echo";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { useFavoritesStore } from "@/lib/favorites-store";

interface ServiceDetailSidebarProps {
  service: any;
  serviceId: string;
  formatPrice: (price: number) => string;
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego" }) => void;
  onAction: (action: () => void) => void;
  onOpenReport: () => void;
  currentUser?: any;
}

export default function ServiceDetailSidebar({
  service,
  serviceId,
  formatPrice,
  onNavigate,
  onAction,
  onOpenReport,
  currentUser,
}: ServiceDetailSidebarProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [liveRating, setLiveRating] = useState(service.rating || 0);

  useEffect(() => {
    if (!service?.id) return;

    setLiveRating(service.rating || 0);

    const channel = getEcho().channel(`product.${service.id}`);
    channel.listen('.NewReviewCreated', (event: any) => {
      if (event.stats && event.stats.averageRating !== undefined) {
        setLiveRating(event.stats.averageRating);
      }
    });

    return () => {
      getEcho().leaveChannel(`product.${service.id}`);
    };
  }, [service?.id, service?.rating]);

  const serviceShareUrl = `https://kampusmarket.id/s/${service.id}`;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const { isFavorited: status } = await checkFavorite(service.id);
        setIsFavorited(status);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };

    checkFavoriteStatus();
  }, [service.id]);

  const toggleFavorite = async () => {
    if (isLoadingFavorite) return;

    try {
      setIsLoadingFavorite(true);
      if (isFavorited) {
        await removeFavorite(service.id);
        setIsFavorited(false);
        toast.success("Dihapus dari favorit", {
          description: `${service.title} telah dihapus dari favorit.`,
        });
      } else {
        await addFavorite(service.id);
        setIsFavorited(true);
        toast.success("Berhasil ditambahkan", {
          description: `${service.title} telah masuk ke favorit.`,
          action: {
            label: "Lihat Favorit",
            onClick: () => onNavigate("favorites"),
          },
        });
      }
      void useFavoritesStore.getState().fetchCount();
    } catch (err: any) {
      console.error("Failed to toggle favorite:", err);
      toast.error("Gagal mengubah status favorit", {
        description: err?.message || "Silakan coba lagi nanti.",
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleCopyServiceLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(serviceShareUrl);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setIsCopied(false);
    }
  };

  const isOwner = currentUser?.id && (currentUser.id === service.seller_id || currentUser.id === service.seller?.id);

  return (
    <div className="space-y-4">
      <DetailShareDialog
        open={showShareModal}
        onOpenChange={(open) => {
          setShowShareModal(open);
          if (!open) setIsCopied(false);
        }}
        shareUrl={serviceShareUrl}
        isCopied={isCopied}
        onCopy={handleCopyServiceLink}
        title="Bagikan Layanan"
        description="Bagikan layanan ini ke:"
        inputAriaLabel="Link layanan"
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{Number(liveRating).toFixed(1)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{service.soldCount || 0} pesanan</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Rentang Harga</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(service.priceMin || service.price || 0)}
              </span>
              {service.priceMax && service.priceMax !== service.priceMin && (
                <>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(service.priceMax)}
                  </span>
                </>
              )}
            </div>
            {service.canNego && <Badge variant="outline" className="mt-2">Harga bisa dinego</Badge>}
          </div>

          <Separator />

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

          <div className="space-y-2">
            <Label>Estimasi Pengerjaan</Label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <Clock className="h-5 w-5 text-primary-600" />
              <span className="font-medium">
                {service.durationIsPlus && service.durationMin
                  ? `${service.durationMin} ${service.durationUnit || 'hari'}+`
                  : service.durationMin && service.durationMax
                  ? `${service.durationMin} - ${service.durationMax} ${service.durationUnit || 'hari'}`
                  : service.durationMin
                  ? `${service.durationMin} ${service.durationUnit || 'hari'}`
                  : "Sesuai kesepakatan"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lokasi</Label>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{service.location || "Tidak ada"}</span>
            </div>
          </div>

          <Separator />

          {isOwner ? (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-center space-y-3">
              <p className="text-primary-800 dark:text-primary-200 font-medium">Ini adalah layanan Anda</p>
              <Button
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => onNavigate("dashboard", "products")}
              >
                Kelola Layanan
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={() => onAction(() => onNavigate("checkout", serviceId))} disabled={service.availabilityStatus === "full"}>
                <Calendar className="h-4 w-4 mr-2" />
                {service.availabilityStatus === "full" ? "Slot Penuh" : "Pesan Jasa"}
              </Button>

              <Button variant="outline" className="w-full" onClick={() => onAction(() => onNavigate("chat", { productId: serviceId, chatAction: "chat" }))}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat Penjual
              </Button>
            </div>
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
            className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => service.seller?.id && onNavigate("profile", service.seller.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && service.seller?.id) {
                onNavigate("profile", service.seller.id);
              }
            }}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={service.seller?.avatar} alt={service.seller?.name} />
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {service.seller?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{service.seller?.name || "Unknown Seller"}</p>
                {service.seller?.is_verified && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1 text-primary-600" />
                    Terverifikasi
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {service.location || "Tidak ada"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
            <div>
              <p className="font-bold text-lg">{service.soldCount || 0}</p>
              <p className="text-muted-foreground">Pesanan</p>
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
                {service.seller.facultyCode || service.seller.facultyName || "N/A"}
              </p>
              <p className="text-muted-foreground">Fakultas</p>
            </div>
          </div>

          {isOwner ? (
            <Button variant="outline" className="w-full" onClick={() => onNavigate("profile", service.seller?.id)}>
              <User className="h-4 w-4 mr-2" />
              Lihat Profil
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onNavigate("profile", service.seller?.id)}>
                <User className="h-4 w-4 mr-2" />
                Lihat Profil
              </Button>
              <Button variant="outline" onClick={() => openWhatsApp(service.seller?.phone, service.seller?.name || 'Penyedia', service.title, true)}>
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          )}

          {!isOwner && (
            <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onAction(onOpenReport)}>
              <Flag className="h-4 w-4 mr-2" />
              Laporkan Layanan
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary-600" /><span className="text-sm">Pembayaran Aman</span></div>
            <div className="flex items-center gap-2"><User className="h-5 w-5 text-primary-600" /><span className="text-sm">Penyedia Terverifikasi</span></div>
            <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary-600" /><span className="text-sm">Respon Cepat</span></div>
            <div className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary-600" /><span className="text-sm">Harga Transparan</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
