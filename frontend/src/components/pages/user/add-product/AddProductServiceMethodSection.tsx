import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Home, MapPin, Clock } from "lucide-react";
import type { AddProductFormData, AddProductShippingOptions } from "@/components/pages/user/add-product/types";

interface AddProductServiceMethodSectionProps {
  formData: AddProductFormData;
  setFormData: (value: AddProductFormData) => void;
  shippingOptions: AddProductShippingOptions;
  setShippingOptions: (value: AddProductShippingOptions) => void;
}

export default function AddProductServiceMethodSection({
  formData,
  setFormData,
  shippingOptions,
  setShippingOptions,
}: AddProductServiceMethodSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Metode Pelayanan
        </CardTitle>
        <CardDescription>Pilih metode pelayanan yang tersedia untuk pelanggan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isOnline
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isOnline
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">Online / Remote</Label>
                <p className="text-sm text-muted-foreground">Layanan via Zoom, Meet, atau platform online lain</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isOnline}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isOnline: checked })}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isOnsite
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isOnsite
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <Home className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">Customer Datang ke Lokasi</Label>
                <p className="text-sm text-muted-foreground">Customer datang ke tempat usaha Anda</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isOnsite}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isOnsite: checked })}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isHomeService
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shippingOptions.isHomeService
                  ? "bg-primary-100 text-primary-600 dark:bg-primary-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <Label className="font-medium cursor-pointer">Anda Datang ke Customer</Label>
                <p className="text-sm text-muted-foreground">Anda mendatangi lokasi customer</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isHomeService}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isHomeService: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationJasa">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lokasi
          </Label>
          <Input
            id="locationJasa"
            placeholder="Contoh: Kampus Limau Manis, Padang"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Lokasi untuk metode customer datang ke lokasi</p>
        </div>

        {!shippingOptions.isOnsite && !shippingOptions.isHomeService && !shippingOptions.isOnline && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">Pilih minimal satu metode pelayanan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
