import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronDown, 
  ChevronUp, 
  History, 
  CreditCard, 
  PackageCheck, 
  Sparkles,
  Hourglass,   // Menunggu Konfirmasi
  Receipt,     // Menunggu Ongkir
  HandCoins,   // COD (Barang)
  Store,       // Ambil Sendiri (Barang) / Datang ke Tempat (Jasa)
  Truck,       // Antar Manual (Barang)
  MapPin,      // Jasa Datang ke Rumah (Home Service)
  Laptop       // Jasa Online / Remote
} from "lucide-react"

interface HistoryEntry {
  id?: string
  uuid?: string
  status: string
  notes?: string
  createdAt?: string
  created_at?: string
  actor?: { id?: string; name?: string } | null
  actorId?: string | number | null
}

interface Props {
  isService: boolean
  orderHistory: HistoryEntry[]
  expandedHistory: string[]
  toggleHistoryExpand: (id: string) => void
  getStatusConfig: (status: string) => { label: string; color: string; bgColor: string; dotColor: string; icon: any }
  formatShortDate: (d: string) => string
  sellerId?: string
  buyerId?: string
}

export default function OrderHistoryTimeline({
  isService,
  orderHistory,
  expandedHistory,
  toggleHistoryExpand,
  getStatusConfig,
  formatShortDate,
  sellerId,
  buyerId,
}: Props) {
  if (!orderHistory || orderHistory.length === 0) return null

  const getActorLabel = (entry: HistoryEntry): string => {
    if (entry.actor?.name) return entry.actor.name
    const actorId = entry.actorId || entry.actor?.id
    if (!actorId) return "Sistem"
    if (String(actorId) === String(sellerId)) return isService ? "Penyedia" : "Penjual"
    if (String(actorId) === String(buyerId)) return isService ? "Pemesan" : "Pembeli"
    return "User"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat {isService ? "Booking" : "Pesanan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

          {orderHistory.map((entry, index) => {
            const id = entry.id || entry.uuid || `h-${index}`
            const dateStr = entry.createdAt || entry.created_at || ""
            let config = getStatusConfig(entry.status)
            
            const notesLower = entry.notes?.toLowerCase() || "";
            const statusLower = entry.status?.toLowerCase() || "";

            // 1. KONDISI: MENUNGGU ONGKIR (Dibuat lebih fleksibel membaca spasi maupun underscore)
            if (
              statusLower.includes("ongkir") || 
              statusLower.includes("ongkos_kirim") || 
              notesLower.includes("ongkir") || 
              notesLower.includes("ongkos kirim")
            ) {
              config = {
                ...config,
                label: "Menunggu Nominal Ongkir",
                icon: Receipt,
              }
            } 
            
            // 2. KONDISI: MENUNGGU KONFIRMASI
            else if (
              statusLower.includes("konfirmasi") || 
              notesLower.includes("menunggu konfirmasi")
            ) {
              config = {
                ...config,
                label: "Menunggu Konfirmasi",
                icon: Hourglass,
              }
            }
            
            // 3. KONDISI: PEMBAYARAN BERHASIL
            else if (notesLower.includes("pembayaran") && notesLower.includes("berhasil")) {
              config = {
                ...config,
                label: "Pembayaran Berhasil",
                icon: CreditCard,
              }
            } 
            
            // 4. KONDISI: PROSES PENGERJAAN / SELESAI
            else if (
              notesLower.includes("mengkonfirmasi barang diserahkan") ||
              notesLower.includes("mengkonfirmasi layanan selesai") ||
              notesLower.includes("barang diserahkan/dikirim") ||
              statusLower.includes("diproses") || 
              statusLower.includes("dikirim") ||
              statusLower.includes("selesai")
            ) {
              if (isService) {
                // ==================== LOGIKA UNTUK JASA ====================
                if (notesLower.includes("datang ke rumah") || notesLower.includes("home service") || notesLower.includes("lokasi pembeli")) {
                  config = {
                    ...config,
                    label: "Penyedia Menuju Lokasi",
                    icon: MapPin,
                  }
                } else if (notesLower.includes("datang ke tempat") || notesLower.includes("on site") || notesLower.includes("lokasi penjual")) {
                  config = {
                    ...config,
                    label: "Pemesan Datang ke Lokasi Jasa",
                    icon: Store,
                  }
                } else if (notesLower.includes("online") || notesLower.includes("remote") || notesLower.includes("digital")) {
                  config = {
                    ...config,
                    label: "Jasa Dikerjakan Secara Online",
                    icon: Laptop,
                  }
                } else {
                  config = {
                    ...config,
                    label: "Layanan Telah Diberikan",
                    icon: Sparkles,
                  }
                }
              } else {
                // ==================== LOGIKA UNTUK BARANG ====================
                if (notesLower.includes("cod") || notesLower.includes("cash on delivery")) {
                  config = {
                    ...config,
                    label: "Barang Diserahkan via COD",
                    icon: HandCoins,
                  }
                } else if (notesLower.includes("ambil sendiri") || notesLower.includes("pickup")) {
                  config = {
                    ...config,
                    label: "Barang Diambil Sendiri",
                    icon: Store,
                  }
                } else if (notesLower.includes("antar manual") || notesLower.includes("kirim")) {
                  config = {
                    ...config,
                    label: "Barang Diantar",
                    icon: Truck,
                  }
                } else {
                  config = {
                    ...config,
                    label: "Barang Telah Diserahkan",
                    icon: PackageCheck,
                  }
                }
              }
            }

            const isExpanded = expandedHistory.includes(id)

            return (
              <div key={id} className="relative pl-8 pb-4 last:pb-0">
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-950 ${config.color}`}>
                  <config.icon className="w-4 h-4" />
                </div>

                <div
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 -ml-1 transition-colors"
                  onClick={() => toggleHistoryExpand(id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {dateStr ? formatShortDate(dateStr) : ""}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      {entry.notes && <p>{entry.notes}</p>}
                      <p className="text-xs">
                        Oleh: {getActorLabel(entry)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
