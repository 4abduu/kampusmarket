import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  MessageCircle,
  Star,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { formatPrice, getStatusConfig } from "@/components/pages/user/orders-list/ordersList.utils";
import type {
  OrderListItem,
  OrdersListPageNavigate,
  OrdersViewMode,
} from "@/components/pages/user/orders-list/ordersList.types";
import ProductImage from "@/components/common/ProductImage";

interface OrdersListCardProps {
  order: OrderListItem;
  viewMode: OrdersViewMode;
  onNavigate: OrdersListPageNavigate;
}

export default function OrdersListCard({ order, viewMode, onNavigate }: OrdersListCardProps) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isService = order.productType === "jasa";
  
  const effectiveViewMode = viewMode;

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onNavigate("order-detail", order.id)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <ProductImage
              src={order.product?.images?.[0] || order.product?.image}
              alt={order.productTitle}
              type={order.productType}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-medium line-clamp-1">{order.productTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {order.quantity}x {isService ? "jasa" : "barang"}
                </p>
              </div>
              <Badge variant={statusConfig.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-5 w-5">
                {(effectiveViewMode === "buyer" ? order.seller?.avatar : order.buyer?.avatar) && (
                  <AvatarImage 
                    src={effectiveViewMode === "buyer" ? order.seller?.avatar : order.buyer?.avatar} 
                    alt={effectiveViewMode === "buyer" ? order.seller?.name : order.buyer?.name}
                  />
                )}
                <AvatarFallback className={`text-[10px] ${isService ? "bg-emerald-100 text-emerald-700" : "bg-primary-100 text-primary-700"}`}>
                  {(effectiveViewMode === "buyer" ? (order.seller?.name || "S") : (order.buyer?.name || "B")).split(" ").map((namePart: string) => namePart[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {effectiveViewMode === "buyer"
                  ? `${isService ? "Penyedia" : "Penjual"}: ${order.seller?.name || "Sistem"}`
                  : `${isService ? "Pemesan" : "Pembeli"}: ${order.buyer?.name || "User"}`}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="font-bold text-primary-600">
                {order.offeredPrice ? formatPrice(order.offeredPrice) : formatPrice(order.totalPrice)}
              </p>
              <div className="flex items-center gap-2">
                {effectiveViewMode === "buyer" && (
                  <>
                    {order.status === "waiting_confirmation" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Tolak
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Setuju
                        </Button>
                      </>
                    )}
                    {order.status === "waiting_payment" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("order-detail", order.id);
                        }}
                      >
                        <Wallet className="h-3 w-3 mr-1" />
                        Bayar
                      </Button>
                    )}
                  </>
                )}

                {effectiveViewMode === "seller" && (
                  <>
                    {order.status === "waiting_price" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Kirim Penawaran
                      </Button>
                    )}
                    {order.status === "waiting_shipping_fee" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Input Ongkir
                      </Button>
                    )}
                    {order.status === "processing" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-primary-600 hover:bg-primary-700"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Konfirmasi
                      </Button>
                    )}
                  </>
                )}

                {order.status === "completed" && (
                  <>
                    {(order as any).isRated || (order as any).hasReview ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("rating", order.id);
                        }}
                      >
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Lihat Rating
                      </Button>
                    ) : (
                      effectiveViewMode === "buyer" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("rating", order.id);
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Beri Rating
                        </Button>
                      )
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Buyer: buka chat via productId. Seller: buka chat via productId & buyerId.
                    if (effectiveViewMode === 'buyer') {
                      onNavigate('chat', { productId: order.product?.id || order.product?.uuid, sellerId: order.seller?.id || order.seller?.uuid, chatAction: 'chat' } as any);
                    } else {
                      onNavigate('chat', { productId: order.product?.id || order.product?.uuid, buyerId: order.buyer?.id || order.buyer?.uuid, sellerId: order.seller?.id || order.seller?.uuid, chatAction: 'chat' } as any);
                    }
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("order-detail", order.id);
                  }}
                >
                  Detail
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
