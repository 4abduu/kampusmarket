import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Home, MapPin, Truck, Wallet } from "lucide-react";
import type { AddProductFormData, AddProductShippingOptions } from "@/components/pages/user/add-product/types";

interface AddProductShippingSectionProps {
  formData: AddProductFormData;
  setFormData: (value: AddProductFormData) => void;
  shippingOptions: AddProductShippingOptions;
  setShippingOptions: (value: AddProductShippingOptions) => void;
}

export default function AddProductShippingSection({
  formData,
  setFormData,
  shippingOptions,
  setShippingOptions,
}: AddProductShippingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Opsi Pengiriman
        </CardTitle>
        <CardDescription>Pilih metode pengiriman yang tersedia untuk pembeli</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isCod
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isCod
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">COD / Ketemuan</Label>
                <p className="text-sm text-muted-foreground">Bayar di tempat, ketemuan di kampus</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isCod}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isCod: checked })}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isPickup
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isPickup
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <Home className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">Ambil Sendiri</Label>
                <p className="text-sm text-muted-foreground">Pembeli datang ke lokasi Anda</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isPickup}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isPickup: checked })}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isDelivery
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isDelivery
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">Antar Manual</Label>
                <p className="text-sm text-muted-foreground">Anda mengantar ke alamat pembeli</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isDelivery}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isDelivery: checked })}
            />
          </div>

          {shippingOptions.isDelivery && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Ongkir Min (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={shippingOptions.deliveryFeeMin}
                    onChange={(e) => setShippingOptions({ ...shippingOptions, deliveryFeeMin: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ongkir Max (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={shippingOptions.deliveryFeeMax}
                    onChange={(e) => setShippingOptions({ ...shippingOptions, deliveryFeeMax: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lokasi
          </Label>
          <Input
            id="location"
            placeholder="Contoh: Limau Manis, Padang"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {!shippingOptions.isCod && !shippingOptions.isPickup && !shippingOptions.isDelivery && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">Pilih minimal satu metode pengiriman</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
