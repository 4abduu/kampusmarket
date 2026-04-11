import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertCircle, CalendarDays, CalendarIcon, Clock } from "lucide-react"

type ServiceBookingSectionProps = {
  bookingDate: Date | undefined
  deadlineDate: Date | undefined
  setBookingDate: (date: Date | undefined) => void
  setDeadlineDate: (date: Date | undefined) => void
  serviceNotes: string
  setServiceNotes: (value: string) => void
  isVariablePricing: boolean
  serviceRequirements: string
  setServiceRequirements: (value: string) => void
  priceType?: "fixed" | "range" | "starting"
  price: number
  priceMin?: number
  priceMax?: number
  durationMin?: number
  durationMax?: number
  durationUnit?: "jam" | "hari" | "minggu" | "bulan"
  formatPrice: (price: number) => string
}

export default function ServiceBookingSection({
  bookingDate,
  deadlineDate,
  setBookingDate,
  setDeadlineDate,
  serviceNotes,
  setServiceNotes,
  isVariablePricing,
  serviceRequirements,
  setServiceRequirements,
  priceType,
  price,
  priceMin,
  priceMax,
  durationMin,
  durationMax,
  durationUnit,
  formatPrice,
}: ServiceBookingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Detail Booking Jasa
        </CardTitle>
        <CardDescription>Pilih tanggal mulai dan tambahkan catatan untuk booking jasa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking-date">Tanggal Mulai Pengerjaan *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="booking-date"
                className={`w-full justify-start text-left font-normal ${
                  !bookingDate ? "text-muted-foreground" : ""
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingDate
                  ? format(bookingDate, "EEEE, d MMMM yyyy", { locale: id })
                  : "Pilih tanggal mulai pengerjaan"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={bookingDate}
                onSelect={setBookingDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Pilih kapan Anda ingin penyedia mulai mengerjakan
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline-date">Deadline / Target Selesai (Opsional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="deadline-date"
                className={`w-full justify-start text-left font-normal ${
                  !deadlineDate ? "text-muted-foreground" : ""
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadlineDate
                  ? format(deadlineDate, "EEEE, d MMMM yyyy", { locale: id })
                  : "Pilih tanggal deadline (opsional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadlineDate}
                onSelect={setDeadlineDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Kapan hasil harus selesai? Bisa dinego via chat dengan penyedia
          </p>
        </div>

        {bookingDate && (durationMin || durationMax) && (
          <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <p className="font-medium text-primary-800 dark:text-primary-200 mb-3">📊 Timeline Pengerjaan</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">Mulai:</span>
                <span className="font-medium">{format(bookingDate, "d MMMM yyyy", { locale: id })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">Durasi:</span>
                <span className="font-medium">
                  {durationMin && durationMax
                    ? `${durationMin} - ${durationMax} ${durationUnit}`
                    : durationMin
                    ? `${durationMin} ${durationUnit}+`
                    : `Maksimal ${durationMax} ${durationUnit}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-24">Est. Selesai:</span>
                <span className="font-medium">
                  {(() => {
                    const unitDays = durationUnit === "jam" ? 1 : durationUnit === "hari" ? 1 : durationUnit === "minggu" ? 7 : 30
                    const maxDays = (durationMax || durationMin || 1) * unitDays
                    const estDate = new Date(bookingDate)
                    estDate.setDate(estDate.getDate() + maxDays)
                    return format(estDate, "d MMMM yyyy", { locale: id })
                  })()}
                </span>
              </div>
              {deadlineDate && (
                <div
                  className={`flex items-center gap-2 text-sm pt-2 border-t border-primary-200 dark:border-primary-700 ${
                    deadlineDate >= bookingDate ? "text-primary-700 dark:text-primary-300" : "text-red-600"
                  }`}
                >
                  <span className="text-muted-foreground w-24">Deadline:</span>
                  <span className="font-medium">{format(deadlineDate, "d MMMM yyyy", { locale: id })}</span>
                  {(() => {
                    const unitDays = durationUnit === "jam" ? 1 : durationUnit === "hari" ? 1 : durationUnit === "minggu" ? 7 : 30
                    const maxDays = (durationMax || durationMin || 1) * unitDays
                    const estDate = new Date(bookingDate)
                    estDate.setDate(estDate.getDate() + maxDays)

                    if (deadlineDate >= estDate) {
                      return <span className="text-primary-600 text-xs ml-2">✓ Timeline aman</span>
                    }
                    return <span className="text-red-500 text-xs ml-2">⚠️ Deadline lebih cepat dari estimasi</span>
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {(durationMin || durationMax) && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Estimasi Durasi</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {durationMin && durationMax
                    ? `${durationMin} - ${durationMax} ${durationUnit}`
                    : durationMin
                    ? `${durationMin} ${durationUnit}+`
                    : `Maksimal ${durationMax} ${durationUnit}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {isVariablePricing && (
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Label htmlFor="service-requirements" className="flex items-center gap-2 text-base font-semibold">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Detail Kebutuhan Jasa *
            </Label>
            <p className="text-sm text-muted-foreground">
              Jelaskan detail kebutuhan kamu, kompleksitas, dan ekspektasi hasil. Penyedia jasa akan memberikan penawaran harga berdasarkan deskripsi ini.
            </p>
            <Textarea
              id="service-requirements"
              placeholder={`Contoh:\n- Untuk foto wisuda dengan 2 orang\n- Perlu 10 foto edit + 5 foto cetak\n- Lokasi di sekitar kampus\n- Waktu pengambilan sore hari`}
              value={serviceRequirements}
              onChange={(e) => setServiceRequirements(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
            {!serviceRequirements.trim() && (
              <p className="text-xs text-amber-600">
                Harap isi detail kebutuhan jasa untuk lanjutkan booking.
              </p>
            )}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">⚠️ Harga Akan Dikonfirmasi</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {priceType === "starting"
                      ? `Harga yang tertera adalah harga minimum (${formatPrice(price)}). Penyedia jasa akan memberikan penawaran harga final berdasarkan kompleksitas kebutuhan kamu.`
                      : `Harga final akan ditentukan dalam rentang ${formatPrice(priceMin || price)} - ${formatPrice(priceMax || price)} berdasarkan kompleksitas pekerjaan.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="service-notes">Catatan Khusus (Opsional)</Label>
          <Textarea
            id="service-notes"
            placeholder="Tambahkan catatan atau permintaan khusus untuk penyedia jasa..."
            value={serviceNotes}
            onChange={(e) => setServiceNotes(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Contoh: "Saya bisa setelah jam 3 sore" atau "Lokasi dekat gerbang utama kampus"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
