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
          Metode Pelayanan <span className="text-red-500">*</span>
        </CardTitle>
        <CardDescription>Pilih metode pelayanan yang tersedia untuk pelanggan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isOnline
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                shippingOptions.isOnline
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Label className="font-medium cursor-pointer">Online</Label>
                <p className="text-sm text-muted-foreground">Layanan via Zoom, Meet, atau platform online lain</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isOnline}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isOnline: checked })}
              className="shrink-0 data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isOnsite
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                shippingOptions.isOnsite
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Label className="font-medium cursor-pointer">Ke Lokasi Penyedia Jasa</Label>
                <p className="text-sm text-muted-foreground">Pelanggan datang ke lokasi Anda</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isOnsite}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isOnsite: checked })}
              className="shrink-0 data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-all ${
          shippingOptions.isHomeService
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-slate-200 dark:border-slate-700"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                shippingOptions.isHomeService
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-800"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Label className="font-medium cursor-pointer">Home Service</Label>
                <p className="text-sm text-muted-foreground">Anda mendatangi lokasi customer</p>
              </div>
            </div>
            <Switch
              checked={shippingOptions.isHomeService}
              onCheckedChange={(checked) => setShippingOptions({ ...shippingOptions, isHomeService: checked })}
              className="shrink-0 data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationJasa">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lokasi <span className="text-red-500">*</span>
          </Label>
          <Input
            id="locationJasa"
            placeholder="Contoh: Kampus Limau Manis, Padang"
            maxLength={100}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value.replace(/[^a-zA-Z0-9\s.,\-()]/g, "") })}
          />
          <p className="text-xs text-muted-foreground">Lokasi untuk metode ke lokasi penyedia jasa</p>
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
