import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Seller {
  name: string
  phone?: string
  id?: string
}

interface Props {
  sellers: Seller[]
  onChat: (sellerId?: string) => void
}

export default function CheckoutContactSellerCard({ sellers, onChat }: Props) {
  const uniqueSellers = Array.from(new Map(sellers.map(s => [s.name, s])).values());
  const isMultiple = uniqueSellers.length > 1;

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
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                  {seller.name.split(" ").map((name) => name[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{seller.name}</p>
                <p className="text-xs text-muted-foreground">{seller.phone || "-"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onChat(seller.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex">
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
