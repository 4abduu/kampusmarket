import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Calendar, FileText, MessageCircle, Package, Timer } from "lucide-react"
import type { Order } from "@/lib/mock-data"

type ServiceData = {
  serviceDate: string
  serviceDeadline: string
  serviceNotes: string
}

interface Props {
  isService: boolean
  order: Order
  offeredPrice: number | null
  formatPrice: (price: number) => string
  serviceData: ServiceData
  onNavigate: (page: string) => void
}

export default function OrderDetailProductCard({
  isService,
  order,
  offeredPrice,
  formatPrice,
  serviceData,
  onNavigate,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detail {isService ? "Layanan" : "Produk"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${isService ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
            {isService ? (
              <Briefcase className="h-8 w-8 text-emerald-600/70" />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium line-clamp-2">{order.productTitle || order.product.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-xs ${isService ? "border-emerald-300 text-emerald-700" : ""}`}>
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
                <Calendar className="h-4 w-4 text-emerald-600" />
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
              {serviceData.serviceNotes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Catatan:</span>
                    <p className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">{serviceData.serviceNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className={isService ? "bg-emerald-100 text-emerald-700" : "bg-primary-100 text-primary-700"}>
              {order.seller.name.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{order.seller.name}</p>
            <p className="text-sm text-muted-foreground">{order.seller.phone}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
