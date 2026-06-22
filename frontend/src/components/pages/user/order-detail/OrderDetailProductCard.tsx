import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Calendar, FileText, MessageCircle, Timer, Maximize2 } from "lucide-react"
import ProductImage from "@/components/common/ProductImage"
import ImageLightbox from "@/components/common/ImageLightbox"
import type { Order } from "@/lib/api/orders"

type ServiceData = {
  serviceDate: string
  serviceDeadline: string
  serviceNotes: string
  notes?: string
}

interface Props {
  isService: boolean
  isSellerView?: boolean
  order: Order
  offeredPrice: number | null
  formatPrice: (price: number) => string
  serviceData: ServiceData
  onNavigate: (page: string, data?: any) => void
}

export default function OrderDetailProductCard({
  isService,
  isSellerView,
  order,
  offeredPrice,
  formatPrice,
  serviceData,
  onNavigate,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = order.product?.images?.[0] || order.product?.image;

  const isClickable = !!imageUrl && !imageError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detail {isService ? "Layanan" : "Produk"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div 
            className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 relative group overflow-hidden ${
              isClickable ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={isClickable ? () => setLightboxOpen(true) : undefined}
          >
            <ProductImage
              src={imageUrl}
              alt={order.productTitle || order.product?.title || "Product Image"}
              type={isService ? "jasa" : "barang"}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {isClickable && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className="font-medium line-clamp-2 hover:text-primary-600 hover:underline cursor-pointer transition-colors"
              onClick={() => onNavigate("product", { id: order.product?.id || order.product?.uuid, type: order.product?.type || (isService ? "jasa" : "barang") })}
            >
              {order.productTitle || order.product.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-xs ${isService ? "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20" : ""}`}>
                {isService ? "Jasa" : "Barang"}
              </Badge>
              <p className="text-sm text-muted-foreground">{order.quantity}x</p>
            </div>
            <p className="font-bold text-primary-600 mt-1">
              {isService && order.product.priceType === "starting"
                ? `Mulai dari ${formatPrice(order.product.priceMin || order.product.price)}`
                : formatPrice(offeredPrice || order.product.price)}
            </p>
          </div>
        </div>

        {isService && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-muted-foreground">Tanggal Pelaksanaan:</span>
                <span className="font-medium">{serviceData.serviceDate}</span>
              </div>
              {serviceData.serviceDeadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Tenggat Waktu:</span>
                  <span className="font-medium">{serviceData.serviceDeadline}</span>
                </div>
              )}
              {serviceData.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Detail Kebutuhan:</span>
                    <p className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap">{serviceData.notes}</p>
                  </div>
                </div>
              )}
              {serviceData.serviceNotes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Catatan Tambahan:</span>
                    <p className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap">{serviceData.serviceNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -ml-2 rounded-lg transition-colors min-w-0 flex-1"
            onClick={() => {
              const targetId = isSellerView ? order.buyer?.id || order.buyer?.uuid : order.seller?.id || order.seller?.uuid;
              if (targetId) onNavigate("profile", { id: targetId });
            }}
          >
            <Avatar className="shrink-0">
              <AvatarImage src={isSellerView ? order.buyer?.avatar : order.seller?.avatar} alt={isSellerView ? order.buyer?.name : order.seller?.name} />
              <AvatarFallback className={isService ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"}>
                {((isSellerView ? order.buyer?.name : order.seller?.name) || "U").split(" ").map((name: string) => name[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium hover:text-primary-600 transition-colors truncate">{isSellerView ? order.buyer?.name || "Pembeli" : order.seller?.name || "Penjual"}</p>
              <p className="text-sm text-muted-foreground truncate">{isSellerView ? (order.buyer?.phone || order.buyer?.email) : (order.seller?.phone || order.seller?.email) || ""}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => {
            const chatPayload: any = { 
              productId: order.product?.id || order.product?.uuid,
              chatAction: "chat"
            };
            if (!isSellerView && (order.seller?.id || order.seller?.uuid)) {
              chatPayload.sellerId = order.seller?.id || order.seller?.uuid;
            } else if (isSellerView && (order.buyer?.id || order.buyer?.uuid)) {
              chatPayload.buyerId = order.buyer?.id || order.buyer?.uuid;
              chatPayload.sellerId = order.seller?.id || order.seller?.uuid;
            }
            onNavigate("chat", chatPayload);
          }}>
            <MessageCircle className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Chat {isSellerView ? (isService ? "Pemesan" : "Pembeli") : (isService ? "Penyedia" : "Penjual")}</span>
          </Button>
        </div>
      </CardContent>

      {lightboxOpen && imageUrl && (
        <ImageLightbox
          src={imageUrl}
          alt={order.productTitle || order.product?.title || "Product Image"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Card>
  )
}
