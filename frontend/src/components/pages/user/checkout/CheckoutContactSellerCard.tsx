import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Seller {
  name: string
  phone?: string
  id?: string
  productId?: string // productId untuk konteks chat
}

interface Props {
  sellers: Seller[]
  onChat: (productId?: string) => void
  isService?: boolean
}

export default function CheckoutContactSellerCard({ sellers, onChat, isService }: Props) {
  const uniqueSellersMap = new Map<string, Seller & { productIds: string[] }>();
  sellers.forEach(s => {
    if (!uniqueSellersMap.has(s.name)) {
      uniqueSellersMap.set(s.name, { ...s, productIds: [] });
    }
    if (s.productId) {
      const existing = uniqueSellersMap.get(s.name)!;
      if (!existing.productIds.includes(s.productId)) {
        existing.productIds.push(s.productId);
      }
    }
  });
  const uniqueSellers = Array.from(uniqueSellersMap.values());
  const isMultiple = uniqueSellers.length > 1;

  const handleWhatsApp = (phone?: string) => {
    if (!phone) return;
    let formatted = phone.replace(/\D/g, "");
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.substring(1);
    }
    window.open(`https://wa.me/${formatted}`, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Hubungi Penjual {isMultiple && `(${uniqueSellers.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueSellers.map((seller, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`text-sm ${isService ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"}`}>
                  {seller.name.split(" ").map((name) => name[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{seller.name}</p>
                <p className="text-xs text-muted-foreground">{seller.phone || "-"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onChat(seller.productIds.join(',') || seller.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => handleWhatsApp(seller.phone)}
                  disabled={!seller.phone}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  WA
                </Button>
              </div>
            </div>
            {idx < uniqueSellers.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
