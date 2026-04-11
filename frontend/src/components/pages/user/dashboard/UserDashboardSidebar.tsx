import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Package, Settings, ShoppingCart, Star, TrendingUp, Wallet } from "lucide-react"

type SidebarUser = {
  name: string
  email: string
  faculty: string | null
}

type Props = {
  currentUser: SidebarUser
  rating: number
  activeTab: string
  setActiveTab: (tab: string) => void
  getFacultyName: (id: string | null) => string
}

export default function UserDashboardSidebar({
  currentUser,
  rating,
  activeTab,
  setActiveTab,
  getFacultyName,
}: Props) {
  return (
    <aside className="lg:col-span-1">
      <Card className="sticky top-20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-lg">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {getFacultyName(currentUser.faculty)}
              </Badge>
            </div>
            <Badge variant="outline" className="mt-2">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating} Rating
            </Badge>
          </div>

          <div className="h-px bg-border mb-4" />

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard", icon: TrendingUp },
              { id: "products", label: "Produk & Jasa", icon: Package },
              { id: "orders", label: "Pesanan", icon: ShoppingCart },
              { id: "wallet", label: "Dompet", icon: Wallet },
              { id: "settings", label: "Pengaturan", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  )
}
