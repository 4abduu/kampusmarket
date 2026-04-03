"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Plus,
  X,
  Image as ImageIcon,
  Truck,
  DollarSign,
  MapPin,
  Tag,
  Wallet,
  Home,
  Clock,
  Scale,
} from "lucide-react";
import { categories, serviceCategories } from "@/lib/mock-data";

interface AddProductPageProps {
  onNavigate: (page: string) => void;
}

type PricingType = "tetap" | "mulai_dari" | "rentang";
type DurationUnit = "jam" | "hari" | "minggu" | "bulan";
type AvailabilityStatus = "available" | "busy" | "full";

export default function AddProductPage({ onNavigate }: AddProductPageProps) {
  const [productType, setProductType] = useState<"barang" | "jasa">("barang");
  const [pricingType, setPricingType] = useState<PricingType>("tetap");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("hari");
  const [durationIsPlus, setDurationIsPlus] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("available");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "bekas",
    price: "",
    priceMin: "",
    priceMax: "",
    originalPrice: "",
    stock: "1",
    weight: "",
    canNego: true,
    location: "",
    durationMin: "",
    durationMax: "",
  });
  
  const [shippingOptions, setShippingOptions] = useState({
    // Barang shipping options
    isCod: false,
    isPickup: true,
    isDelivery: false,
    deliveryFeeMin: 5000,
    deliveryFeeMax: 15000,
    // Jasa service method options
    isOnline: false,
    isOnsite: false,
    isHomeService: false,
  });
  
  const [images, setImages] = useState<string[]>([]);

  const formatPrice = (price: string) => {
    if (!price) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(price) || 0);
  };

  const getPricePreview = () => {
    if (productType === "barang") {
      if (!formData.price) return "Rp -";
      return `Rp ${formatPrice(formData.price)}`;
    }
    
    switch (pricingType) {
      case "tetap":
        if (!formData.price) return "Rp -";
        return `Rp ${formatPrice(formData.price)}`;
      case "mulai_dari":
        if (!formData.priceMin) return "Mulai Rp -";
        return `Mulai Rp ${formatPrice(formData.priceMin)}`;
      case "rentang":
        if (!formData.priceMin && !formData.priceMax) return "Rp - - Rp -";
        return `Rp ${formatPrice(formData.priceMin) || "-"} - Rp ${formatPrice(formData.priceMax) || "-"}`;
      default:
        return "Rp -";
    }
  };

  const getDurationPreview = () => {
    if (productType !== "jasa") return null;
    
    const min = formData.durationMin;
    const max = formData.durationMax;
    
    const unitMap = {
      jam: "jam",
      hari: "hari",
      minggu: "minggu",
      bulan: "bulan",
    };
    const unit = unitMap[durationUnit];
    
    if (!min && !max) return "Durasi belum ditentukan";
    
    if (durationIsPlus && min) {
      return `${min} ${unit}+`;
    }
    
    if (min && max) {
      return `${min} - ${max} ${unit}`;
    } else if (min) {
      return `${min} ${unit}`;
    } else if (max) {
      return `Maksimal ${max} ${unit}`;
    }
    
    return "Durasi belum ditentukan";
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productType === "barang" && !shippingOptions.isCod && !shippingOptions.isPickup && !shippingOptions.isDelivery) {
      alert("Pilih minimal satu metode pengiriman!");
      return;
    }
    
    if (productType === "jasa") {
      // Validate service method
      if (!shippingOptions.isOnsite && !shippingOptions.isHomeService && !shippingOptions.isOnline) {
        alert("Pilih minimal satu metode pelayanan!");
        return;
      }
      
      if (pricingType === "tetap" && !formData.price) {
        alert("Masukkan harga jasa!");
        return;
      }
      if (pricingType === "mulai_dari" && !formData.priceMin) {
        alert("Masukkan harga minimum!");
        return;
      }
      if (pricingType === "rentang" && (!formData.priceMin || !formData.priceMax)) {
        alert("Masukkan harga minimum dan maksimum!");
        return;
      }
    }
    
    alert("Produk berhasil disimpan!");
    onNavigate("dashboard");
  };

  const currentCategories = productType === "barang" ? categories : serviceCategories;

  const handlePricingTypeChange = (value: PricingType) => {
    setPricingType(value);
    setFormData(prev => ({
      ...prev,
      price: "",
      priceMin: "",
      priceMax: "",
    }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
            <p className="text-muted-foreground">Jual barang atau tawarkan jasa kamu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipe Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setProductType("barang")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    productType === "barang"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <Package className="h-8 w-8 mb-2 text-primary-600" />
                  <p className="font-medium">Barang</p>
                  <p className="text-sm text-muted-foreground">Jual barang baru atau bekas</p>
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("jasa")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    productType === "jasa"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <DollarSign className="h-8 w-8 mb-2 text-primary-600" />
                  <p className="font-medium">Jasa</p>
                  <p className="text-sm text-muted-foreground">Tawarkan layanan/jasa</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul {productType === "barang" ? "Produk" : "Jasa"}</Label>
                <Input
                  id="title"
                  placeholder={productType === "barang" 
                    ? "Contoh: Kalkulator Scientific Casio FX-991EX" 
                    : "Contoh: Jasa Desain Grafis untuk Logo"
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder={productType === "barang" 
                    ? "Jelaskan kondisi, fitur, atau detail lainnya..." 
                    : "Jelaskan layanan yang ditawarkan, pengalaman, portofolio, dll..."
                  }
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {productType === "barang" && (
                  <div className="space-y-2">
                    <Label htmlFor="condition">Kondisi</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">Baru</SelectItem>
                        <SelectItem value="bekas">Bekas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
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
                  {/* Pricing Type Selection for Jasa */}
                  <div className="space-y-3">
                    <Label>Tipe Harga</Label>
                    <RadioGroup 
                      value={pricingType} 
                      onValueChange={(value) => handlePricingTypeChange(value as PricingType)}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {[
                        { value: "tetap", label: "Harga Tetap", desc: "Satu harga pasti" },
                        { value: "mulai_dari", label: "Mulai Dari", desc: "Harga minimum" },
                        { value: "rentang", label: "Rentang Harga", desc: "Min - Max" },
                      ].map((option) => (
                        <div key={option.value} className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          pricingType === option.value 
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}>
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer">
                            <span className="font-medium">{option.label}</span>
                            <p className="text-xs text-muted-foreground">{option.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Price Input Fields based on Type */}
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

                  {/* Duration Fields for Jasa */}
                  <div className="pt-4 border-t dark:border-slate-700">
                    <Label className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />
                      Estimasi Durasi Pengerjaan
                    </Label>
                    
                    <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Mode "Lebih dari"</p>
                          <p className="text-xs text-muted-foreground">Contoh: "7 hari+" atau "30 hari+"</p>
                        </div>
                        <Switch
                          checked={durationIsPlus}
                          onCheckedChange={setDurationIsPlus}
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="durationMin" className="text-sm text-muted-foreground">
                          Durasi Minimal
                        </Label>
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
                        <Select
                          value={durationUnit}
                          onValueChange={(value) => setDurationUnit(value as DurationUnit)}
                        >
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
                        <p className="font-medium text-primary-700 dark:text-primary-300">
                          {getDurationPreview()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Availability Status for Jasa */}
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
                  {/* Pricing for Barang */}
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
            </CardContent>
          </Card>

          {/* Price Preview Card */}
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preview Harga</p>
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {getPricePreview()}
                  </p>
                  {productType === "jasa" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {getDurationPreview()}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-300">
                  {formData.canNego ? "Bisa Nego" : "Harga Fix"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto {productType === "barang" ? "Produk" : "Portofolio"}</CardTitle>
              <CardDescription>
                Upload hingga 5 foto. Foto pertama akan menjadi foto utama.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 relative group overflow-hidden"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-label="Hapus gambar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Utama</Badge>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Options - Only for Barang */}
          {productType === "barang" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Opsi Pengiriman
                </CardTitle>
                <CardDescription>
                  Pilih metode pengiriman yang tersedia untuk pembeli
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* COD Toggle */}
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  shippingOptions.isCod 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        shippingOptions.isCod ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
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
                      onCheckedChange={(checked) => 
                        setShippingOptions({ ...shippingOptions, isCod: checked })
                      }
                    />
                  </div>
                </div>

                {/* Pickup Toggle */}
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  shippingOptions.isPickup 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        shippingOptions.isPickup ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
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
                      onCheckedChange={(checked) => 
                        setShippingOptions({ ...shippingOptions, isPickup: checked })
                      }
                    />
                  </div>
                </div>

                {/* Delivery Toggle */}
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  shippingOptions.isDelivery 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                    : "border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        shippingOptions.isDelivery ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
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
                      onCheckedChange={(checked) => 
                        setShippingOptions({ ...shippingOptions, isDelivery: checked })
                      }
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
                            onChange={(e) => 
                              setShippingOptions({ 
                                ...shippingOptions, 
                                deliveryFeeMin: parseInt(e.target.value) || 0 
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ongkir Max (Rp)</Label>
                          <Input
                            type="number"
                            placeholder="15000"
                            value={shippingOptions.deliveryFeeMax}
                            onChange={(e) => 
                              setShippingOptions({ 
                                ...shippingOptions, 
                                deliveryFeeMax: parseInt(e.target.value) || 0 
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Input */}
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
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ⚠️ Pilih minimal satu metode pengiriman
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

            {/* Location for Jasa */}
          {productType === "jasa" && (
            <>
              {/* Metode Pelayanan for Jasa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Metode Pelayanan
                  </CardTitle>
                  <CardDescription>
                    Pilih metode pelayanan yang tersedia untuk pelanggan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Online/Remote */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    shippingOptions.isOnline 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                      : "border-slate-200 dark:border-slate-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          shippingOptions.isOnline ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}>
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <Label className="font-medium cursor-pointer">Online / Remote</Label>
                          <p className="text-sm text-muted-foreground">Layanan via Zoom, Google Meet, atau platform online lainnya</p>
                        </div>
                      </div>
                      <Switch
                        checked={shippingOptions.isOnline}
                        onCheckedChange={(checked) => 
                          setShippingOptions({ ...shippingOptions, isOnline: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Onsite - Customer Datang ke Lokasi */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    shippingOptions.isOnsite 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                      : "border-slate-200 dark:border-slate-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          shippingOptions.isOnsite ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}>
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <Label className="font-medium cursor-pointer">Customer Datang ke Lokasi</Label>
                          <p className="text-sm text-muted-foreground">Customer datang ke lokasi/tempat usaha Anda</p>
                        </div>
                      </div>
                      <Switch
                        checked={shippingOptions.isOnsite}
                        onCheckedChange={(checked) => 
                          setShippingOptions({ ...shippingOptions, isOnsite: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Home Service - Penyedia Datang ke Customer */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    shippingOptions.isHomeService 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                      : "border-slate-200 dark:border-slate-700"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          shippingOptions.isHomeService ? "bg-primary-100 text-primary-600 dark:bg-primary-800" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <Label className="font-medium cursor-pointer">Anda Datang ke Customer</Label>
                          <p className="text-sm text-muted-foreground">Anda mendatangi lokasi customer (home service)</p>
                        </div>
                      </div>
                      <Switch
                        checked={shippingOptions.isHomeService}
                        onCheckedChange={(checked) => 
                          setShippingOptions({ ...shippingOptions, isHomeService: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Location Input */}
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
                    <p className="text-xs text-muted-foreground">
                      Lokasi untuk metode "Customer Datang ke Lokasi"
                    </p>
                  </div>

                  {!shippingOptions.isOnsite && !shippingOptions.isHomeService && !shippingOptions.isOnline && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        ⚠️ Pilih minimal satu metode pelayanan
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onNavigate("dashboard")}>
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-primary-600 hover:bg-primary-700"
              disabled={
                (productType === "barang" && !shippingOptions.isCod && !shippingOptions.isPickup && !shippingOptions.isDelivery) ||
                (productType === "jasa" && !shippingOptions.isOnsite && !shippingOptions.isHomeService && !shippingOptions.isOnline)
              }
            >
              <Tag className="h-4 w-4 mr-2" />
              Simpan {productType === "barang" ? "Produk" : "Jasa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
