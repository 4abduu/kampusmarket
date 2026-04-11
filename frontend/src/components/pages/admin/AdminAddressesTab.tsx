import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MapPin, Home, Building, MapPinned } from "lucide-react";

interface Props {
  filteredAddresses: any[];
  users: any[];
  addressSearchTerm: string;
  setAddressSearchTerm: (value: string) => void;
  getInitials: (value?: string | null) => string;
}

export default function AdminAddressesTab({ filteredAddresses, users, addressSearchTerm, setAddressSearchTerm, getInitials }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Daftar Alamat User</CardTitle><CardDescription>Lihat dan kelola semua alamat pengiriman user</CardDescription></div>
            <div className="text-sm text-muted-foreground">Total {filteredAddresses.length} alamat</div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari alamat, penerima, label, catatan..." value={addressSearchTerm} onChange={(e) => setAddressSearchTerm(e.target.value)} className="pl-9" />
            </div>
            {addressSearchTerm && <Button variant="ghost" size="sm" onClick={() => setAddressSearchTerm("")}>Reset</Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><MapPin className="h-16 w-16 mx-auto mb-4 opacity-30" /><p className="text-lg">Tidak ada alamat ditemukan</p><p className="text-sm">Coba ubah filter pencarian</p></div>
        ) : (
          <div className="space-y-6">
            {Array.from(new Set(filteredAddresses.map((a) => a.userId))).map((userId) => {
              const user = users.find((u) => u.id === userId);
              const userAddresses = filteredAddresses.filter((addr) => addr.userId === userId);
              if (!user) return null;
              return (
                <div key={userId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10"><AvatarFallback className={`text-sm ${user.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>{getInitials(user.name)}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div>
                    <Badge variant="outline" className="ml-auto">{userAddresses.length} alamat</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {userAddresses.map((address) => {
                      const AddressIcon = address.label.toLowerCase() === "kos" ? Home : address.label.toLowerCase() === "rumah" ? Building : address.label.toLowerCase() === "kantor" ? Building : MapPinned;
                      return (
                        <div key={address.id} className={`border rounded-lg p-3 ${address.isPrimary ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "bg-slate-50 dark:bg-slate-800"}`}>
                          <div className="flex items-start gap-2"><div className={`p-1.5 rounded ${address.isPrimary ? "bg-primary-100 dark:bg-primary-800" : "bg-slate-200 dark:bg-slate-700"}`}><AddressIcon className={`h-4 w-4 ${address.isPrimary ? "text-primary-600" : "text-slate-500"}`} /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-medium text-sm">{address.label}</span>{address.isPrimary && <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">Utama</Badge>}</div><p className="text-sm mt-1">{address.recipient}</p>{address.phone && <p className="text-xs text-muted-foreground">{address.phone}</p>}<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{address.address}</p>{address.notes && <p className="text-xs text-muted-foreground mt-1 italic">📍 {address.notes}</p>}</div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
