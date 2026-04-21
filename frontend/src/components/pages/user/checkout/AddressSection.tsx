import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building, Check, Edit, Home, MapPin, MapPinned, Plus, Trash2 } from "lucide-react"

import type { Address } from "@/components/pages/user/checkout/checkout.types"

type AddressSectionProps = {
  addresses: Address[]
  selectedAddressId: string | null
  setSelectedAddressId: (id: string | null) => void
  onAddNewAddress: () => void
  onEditAddress: (address: Address) => void
  onDeleteAddress: (addressId: string) => void
  onSetPrimaryAddress: (addressId: string) => void
}

const getAddressIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "kos":
      return Home
    case "rumah":
      return Building
    case "kantor":
      return Building
    case "kampus":
      return MapPinned
    default:
      return MapPin
  }
}

export default function AddressSection({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetPrimaryAddress,
}: AddressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Alamat Pengiriman
        </CardTitle>
        <CardDescription>Pilih alamat atau tambah alamat baru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length > 0 && (
          <div className="space-y-3">
            <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
              {addresses.map((address) => {
                const AddressIcon = getAddressIcon(address.label)
                return (
                  <label
                    key={address.id}
                    htmlFor={address.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AddressIcon className="h-4 w-4 text-primary-600" />
                        <span className="font-medium">{address.label}</span>
                        {address.isPrimary && (
                          <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">
                            Utama
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mt-1">{address.recipient}</p>
                      {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{address.address}</p>
                      {address.notes && <p className="text-xs text-muted-foreground mt-1 italic">{address.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!address.isPrimary && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault()
                            onSetPrimaryAddress(address.id)
                          }}
                          title="Jadikan Alamat Utama"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          onEditAddress(address)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={(e) => {
                          e.preventDefault()
                          onDeleteAddress(address.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </div>
        )}

        <Button variant="outline" className="w-full border-dashed" onClick={onAddNewAddress}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Alamat Baru
        </Button>
      </CardContent>
    </Card>
  )
}
