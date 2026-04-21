"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DetailShareDialog from "@/components/pages/guest/shared/DetailShareDialog";
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

interface ServiceDetailSidebarProps {
  service: any;
  serviceId: string;
  formatPrice: (price: number) => string;
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego" }) => void;
  onAction: (action: () => void) => void;
}

export default function ServiceDetailSidebar({
  service,
  serviceId,
  formatPrice,
  onNavigate,
  onAction,
}: ServiceDetailSidebarProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const serviceShareUrl = `https://kampusmarket.id/s/${service.id}`;

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
                <span>{service.rating || 0}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{service.sold_count || 0} pesanan</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Rentang Harga</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(service.price_min || service.price || 0)}
              </span>
              {service.price_max && service.price_max !== service.price_min && (
                <>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(service.price_max)}
                  </span>
                </>
              )}
            </div>
            {service.can_negotiate && <Badge variant="outline" className="mt-2">Harga bisa dinego</Badge>}
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
                {service.duration_is_plus && service.duration_min
                  ? `${service.duration_min} ${service.duration_unit || 'hari'}+`
                  : service.duration_min && service.duration_max
                  ? `${service.duration_min} - ${service.duration_max} ${service.duration_unit || 'hari'}`
                  : service.duration_min
                  ? `${service.duration_min} ${service.duration_unit || 'hari'}`
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
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
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
              <p className="font-bold text-lg">{service.sold_count || 0}</p>
              <p className="text-muted-foreground">Pesanan</p>
            </div>
            <div>
              <p className="font-bold text-lg flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {service.rating || 0}
              </p>
              <p className="text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="font-bold text-lg">98%</p>
              <p className="text-muted-foreground">Respon</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onAction(() => onNavigate("chat", { productId: serviceId, chatAction: "chat" }))}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-2" />
            Laporkan Layanan
          </Button>
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
