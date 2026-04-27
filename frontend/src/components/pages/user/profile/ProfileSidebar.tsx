import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, Calendar, MapPin, MessageCircle, Package, Shield, Star, Settings, Edit } from "lucide-react";

interface ProfileUserInfo {
  id: string;
  name: string;
  faculty?: string | null;
  location?: string;
  isVerified?: boolean;
}

interface ProfileSidebarProps {
  user: ProfileUserInfo;
  isOwnProfile?: boolean;
  totalSold: number;
  avgRating: number;
  totalReviews: number;
  memberSince: string;
  userBio?: string | null;
  onNavigate: (page: string, data?: string | { userId?: string; productId?: string }) => void;
}

export default function ProfileSidebar({
  user,
  isOwnProfile = false,
  totalSold,
  avgRating,
  totalReviews,
  memberSince,
  userBio,
  onNavigate,
}: ProfileSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{user.name}</h1>
              {user.isVerified && (
                <Badge variant="outline" className="text-primary-600 border-primary-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Terverifikasi
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{user.faculty}</p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {user.location || "Universitas Indonesia"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <p className="font-bold text-lg text-primary-600">{totalSold}</p>
              <p className="text-xs text-muted-foreground">Terjual</p>
            </div>
            <div>
              <p className="font-bold text-lg">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="font-bold text-lg">{totalReviews}</p>
              <p className="text-xs text-muted-foreground">Ulasan</p>
            </div>
          </div>

          <div className="space-y-2">
            {isOwnProfile ? (
              <>
                <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("edit-profile")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profil
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("dashboard")}>
                  <Package className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("chat", { userId: user.id })}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Hubungi Penjual
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onNavigate("catalog")}>
                  Lihat Semua Produk
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi Penjual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Bergabung sejak</p>
              <p className="font-medium">{memberSince}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="font-medium">
                {avgRating} ({totalReviews} ulasan)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Produk Terjual</p>
              <p className="font-medium">{totalSold} produk</p>
            </div>
          </div>

          <Separator className="my-3" />

          <div>
            <h4 className="text-sm font-medium mb-2">Bio</h4>
            <p className="text-sm text-muted-foreground">
              {userBio || `Mahasiswa dari ${user.faculty}. Aktif bertransaksi di kampus market.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Badge Penjual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.isVerified && (
              <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                <Shield className="h-3 w-3 mr-1" />
                Terverifikasi
              </Badge>
            )}
            {totalSold >= 10 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Award className="h-3 w-3 mr-1" />
                Seller Aktif
              </Badge>
            )}
            {avgRating >= 4.5 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                <Star className="h-3 w-3 mr-1" />
                Rating Tinggi
              </Badge>
            )}
            {totalSold >= 50 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Package className="h-3 w-3 mr-1" />
                Power Seller
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
