import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, CalendarDays, Clock, Monitor, Truck } from "lucide-react"
import type { CheckoutShippingOption } from "@/components/pages/user/checkout/checkout.types"

interface Props {
  isService: boolean
  shippingMethod: string
  setShippingMethod: (value: string) => void
  shippingOptions: CheckoutShippingOption[]
  selectedShipping?: CheckoutShippingOption
}

export default function CheckoutShippingMethodSection({
  isService,
  shippingMethod,
  setShippingMethod,
  shippingOptions,
  selectedShipping,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {isService ? (
            <>
              <CalendarDays className="h-5 w-5" />
              Metode Layanan
            </>
          ) : (
            <>
              <Truck className="h-5 w-5" />
              Metode Pengiriman
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                  shippingMethod === option.id
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                    : "hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {option.icon ? <option.icon className="h-5 w-5 text-primary-600" /> : <Truck className="h-5 w-5 text-primary-600" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </RadioGroup>

        {selectedShipping && (
          <div className={`p-4 rounded-lg border ${selectedShipping.info.color} mt-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{selectedShipping.info.title}</p>
                <p className="text-sm mt-1">{selectedShipping.info.description}</p>
              </div>
            </div>
          </div>
        )}

        {!isService && shippingMethod === "delivery" && (
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Estimasi Ongkir</p>
                <p className="text-muted-foreground mt-1">
                  Penjual akan melihat alamatmu dan menghubungi via WhatsApp untuk
                  konfirmasi ongkir. Estimasi ongkir: <strong>Rp 5.000 - Rp 20.000</strong> (tergantung jarak).
                </p>
              </div>
            </div>
          </div>
        )}

        {isService && shippingMethod === "online" && (
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border">
            <div className="flex items-start gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Layanan Online/Remote</p>
                <p className="text-muted-foreground mt-1">
                  Penyedia jasa akan menghubungi kamu untuk koordinasi layanan secara online.
                  Pastikan nomor WhatsApp kamu aktif.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
