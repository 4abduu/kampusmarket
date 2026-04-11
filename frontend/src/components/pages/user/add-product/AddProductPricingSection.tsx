import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, DollarSign, Scale } from "lucide-react";
import type {
  AddProductFormData,
  AvailabilityStatus,
  DurationUnit,
  PricingType,
  ProductType,
} from "@/components/pages/user/add-product/types";

interface AddProductPricingSectionProps {
  productType: ProductType;
  pricingType: PricingType;
  setPricingType: (value: PricingType) => void;
  durationUnit: DurationUnit;
  setDurationUnit: (value: DurationUnit) => void;
  durationIsPlus: boolean;
  setDurationIsPlus: (value: boolean) => void;
  availabilityStatus: AvailabilityStatus;
  setAvailabilityStatus: (value: AvailabilityStatus) => void;
  formData: AddProductFormData;
  setFormData: (value: AddProductFormData) => void;
  getDurationPreview: () => string | null;
}

export default function AddProductPricingSection({
  productType,
  pricingType,
  setPricingType,
  durationUnit,
  setDurationUnit,
  durationIsPlus,
  setDurationIsPlus,
  availabilityStatus,
  setAvailabilityStatus,
  formData,
  setFormData,
  getDurationPreview,
}: AddProductPricingSectionProps) {
  const onPricingTypeChange = (value: PricingType) => {
    setPricingType(value);
    setFormData({ ...formData, price: "", priceMin: "", priceMax: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Harga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productType === "jasa" ? (
          <>
            <div className="space-y-3">
              <Label>Tipe Harga</Label>
              <RadioGroup
                value={pricingType}
                onValueChange={(value) => onPricingTypeChange(value as PricingType)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {[
                  { value: "tetap", label: "Harga Tetap", desc: "Satu harga pasti" },
                  { value: "mulai_dari", label: "Mulai Dari", desc: "Harga minimum" },
                  { value: "rentang", label: "Rentang Harga", desc: "Min - Max" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      pricingType === option.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      <span className="font-medium">{option.label}</span>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {pricingType === "tetap" && (
              <div className="space-y-2">
                <Label htmlFor="price">Harga Jasa</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="100000"
                    className="pl-10"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
            )}

            {pricingType === "mulai_dari" && (
              <div className="space-y-2">
                <Label htmlFor="priceMin">Harga Mulai Dari</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="50000"
                    className="pl-10"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  />
                </div>
              </div>
            )}

            {pricingType === "rentang" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMinJasa">Harga Minimum</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <Input
                      id="priceMinJasa"
                      type="number"
                      placeholder="50000"
                      className="pl-10"
                      value={formData.priceMin}
                      onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMaxJasa">Harga Maksimum</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <Input
                      id="priceMaxJasa"
                      type="number"
                      placeholder="150000"
                      className="pl-10"
                      value={formData.priceMax}
                      onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t dark:border-slate-700">
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                Estimasi Durasi Pengerjaan
              </Label>

              <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Mode Lebih dari</p>
                    <p className="text-xs text-muted-foreground">Contoh: 7 hari+ atau 30 hari+</p>
                  </div>
                  <Switch checked={durationIsPlus} onCheckedChange={setDurationIsPlus} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMin" className="text-sm text-muted-foreground">Durasi Minimal</Label>
                  <Input
                    id="durationMin"
                    type="number"
                    placeholder={durationIsPlus ? "30" : "7"}
                    min="1"
                    value={formData.durationMin}
                    onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMax" className="text-sm text-muted-foreground">
                    {durationIsPlus ? "(Tidak perlu)" : "Durasi Maksimal"}
                  </Label>
                  <Input
                    id="durationMax"
                    type="number"
                    placeholder="14"
                    min="1"
                    value={formData.durationMax}
                    onChange={(e) => setFormData({ ...formData, durationMax: e.target.value })}
                    disabled={durationIsPlus}
                    className={durationIsPlus ? "bg-slate-100 dark:bg-slate-800" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Satuan</Label>
                  <Select value={durationUnit} onValueChange={(value) => setDurationUnit(value as DurationUnit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jam">Jam</SelectItem>
                      <SelectItem value="hari">Hari</SelectItem>
                      <SelectItem value="minggu">Minggu</SelectItem>
                      <SelectItem value="bulan">Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(formData.durationMin || formData.durationMax) && (
                <div className="mt-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <p className="text-sm text-muted-foreground">Preview durasi:</p>
                  <p className="font-medium text-primary-700 dark:text-primary-300">{getDurationPreview()}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t dark:border-slate-700">
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                Status Ketersediaan
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "available", label: "Tersedia", desc: "Siap menerima order", color: "border-primary-500 bg-primary-50 dark:bg-primary-900/20" },
                  { id: "busy", label: "Sibuk", desc: "Tampil info tapi bisa chat", color: "border-amber-500 bg-amber-50 dark:bg-amber-900/20" },
                  { id: "full", label: "Penuh", desc: "Tidak bisa order baru", color: "border-red-500 bg-red-50 dark:bg-red-900/20" },
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setAvailabilityStatus(status.id as AvailabilityStatus)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      availabilityStatus === status.id
                        ? status.color
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{status.label}</p>
                    <p className="text-xs text-muted-foreground">{status.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga Jual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="180000"
                    className="pl-10"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Harga Asli (Opsional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="350000"
                    className="pl-10"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-1">
                  <Scale className="h-4 w-4" />
                  Berat (gram)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="500"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {productType === "barang" && (
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">Bisa Nego</p>
              <p className="text-sm text-muted-foreground">Izinkan pembeli menawar harga</p>
            </div>
            <Switch
              checked={formData.canNego}
              onCheckedChange={(checked) => setFormData({ ...formData, canNego: checked })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
