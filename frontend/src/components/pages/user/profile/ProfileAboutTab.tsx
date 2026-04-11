import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileAboutTabProps {
  userName: string;
  userFaculty?: string | null;
  userBio?: string | null;
}

export default function ProfileAboutTab({ userName, userFaculty, userBio }: ProfileAboutTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Tentang {userName}</h3>
        <p className="text-muted-foreground mb-6">
          {userBio || `Mahasiswa dari ${userFaculty}. Aktif menjual berbagai barang dan jasa kampus. Selalu berusaha memberikan pelayanan terbaik untuk pembeli.`}
        </p>

        <Separator className="my-4" />

        <h4 className="font-medium mb-3">Kebijakan Toko</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
            <p>Fast response untuk setiap pertanyaan pembeli</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
            <p>Barang dijamin sesuai deskripsi dan foto</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
            <p>Menerima pengembalian jika barang tidak sesuai</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
            <p>Pengiriman fleksibel sesuai kesepakatan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
