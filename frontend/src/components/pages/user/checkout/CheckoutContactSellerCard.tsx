import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Phone } from "lucide-react"

interface Props {
  sellerName: string
  sellerPhone?: string
  onNavigate: (page: string) => void
}

export default function CheckoutContactSellerCard({ sellerName, sellerPhone, onNavigate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Hubungi Penjual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {sellerName.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{sellerName}</p>
            <p className="text-sm text-muted-foreground">{sellerPhone}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
