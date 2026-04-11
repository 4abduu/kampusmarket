"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, serviceCategories } from "@/lib/mock-data";
import AddProductTypeSelector from "@/components/pages/user/add-product/AddProductTypeSelector";
import AddProductBasicInfoSection from "@/components/pages/user/add-product/AddProductBasicInfoSection";
import AddProductPricingSection from "@/components/pages/user/add-product/AddProductPricingSection";
import AddProductPricePreview from "@/components/pages/user/add-product/AddProductPricePreview";
import AddProductImagesSection from "@/components/pages/user/add-product/AddProductImagesSection";
import AddProductShippingSection from "@/components/pages/user/add-product/AddProductShippingSection";
import AddProductServiceMethodSection from "@/components/pages/user/add-product/AddProductServiceMethodSection";
import AddProductActions from "@/components/pages/user/add-product/AddProductActions";
import { buildAddProductPayload } from "@/components/pages/user/add-product/addProduct.payload";
import type {
  AddProductFormData,
  AddProductShippingOptions,
  AvailabilityStatus,
  DurationUnit,
  PricingType,
  ProductType,
} from "@/components/pages/user/add-product/types";

interface AddProductPageProps {
  onNavigate: (page: string) => void;
}

const defaultFormData: AddProductFormData = {
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
};

const defaultShippingOptions: AddProductShippingOptions = {
  isCod: false,
  isPickup: true,
  isDelivery: false,
  deliveryFeeMin: 5000,
  deliveryFeeMax: 15000,
  isOnline: false,
  isOnsite: false,
  isHomeService: false,
};

export default function AddProductPage({ onNavigate }: AddProductPageProps) {
  const [productType, setProductType] = useState<ProductType>("barang");
  const [pricingType, setPricingType] = useState<PricingType>("tetap");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("hari");
  const [durationIsPlus, setDurationIsPlus] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("available");
  const [formData, setFormData] = useState<AddProductFormData>(defaultFormData);
  const [shippingOptions, setShippingOptions] = useState<AddProductShippingOptions>(defaultShippingOptions);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (productType === "jasa" && formData.canNego) {
      setFormData((prev) => ({ ...prev, canNego: false }));
    }
  }, [productType, formData.canNego]);

  const formatPrice = (price: string) => {
    if (!price) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(price, 10) || 0);
  };

  const getPricePreview = () => {
    if (productType === "barang") {
      if (!formData.price) return "Rp -";
      return `Rp ${formatPrice(formData.price)}`;
    }

    if (pricingType === "tetap") {
      if (!formData.price) return "Rp -";
      return `Rp ${formatPrice(formData.price)}`;
    }

    if (pricingType === "mulai_dari") {
      if (!formData.priceMin) return "Mulai Rp -";
      return `Mulai Rp ${formatPrice(formData.priceMin)}`;
    }

    if (!formData.priceMin && !formData.priceMax) return "Rp - - Rp -";
    return `Rp ${formatPrice(formData.priceMin) || "-"} - Rp ${formatPrice(formData.priceMax) || "-"}`;
  };

  const getDurationPreview = () => {
    if (productType !== "jasa") return null;

    const min = formData.durationMin;
    const max = formData.durationMax;
    const unit = durationUnit;

    if (!min && !max) return "Durasi belum ditentukan";
    if (durationIsPlus && min) return `${min} ${unit}+`;
    if (min && max) return `${min} - ${max} ${unit}`;
    if (min) return `${min} ${unit}`;
    if (max) return `Maksimal ${max} ${unit}`;
    return "Durasi belum ditentukan";
  };

  const submitDisabled =
    (productType === "barang" && !shippingOptions.isCod && !shippingOptions.isPickup && !shippingOptions.isDelivery) ||
    (productType === "jasa" && !shippingOptions.isOnsite && !shippingOptions.isHomeService && !shippingOptions.isOnline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submitDisabled) {
      alert(productType === "barang" ? "Pilih minimal satu metode pengiriman!" : "Pilih minimal satu metode pelayanan!");
      return;
    }

    if (productType === "jasa") {
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

    const payload = buildAddProductPayload(
      productType,
      pricingType,
      durationUnit,
      durationIsPlus,
      availabilityStatus,
      formData,
      shippingOptions,
    );

    // Placeholder for API integration.
    console.log("submit add product payload", payload, { imagesCount: images.length });
    alert("Produk berhasil disimpan!");
    onNavigate("dashboard");
  };

  const currentCategories = productType === "barang" ? categories : serviceCategories;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <AddProductTypeSelector productType={productType} setProductType={setProductType} />

          <AddProductBasicInfoSection
            productType={productType}
            formData={formData}
            setFormData={setFormData}
            currentCategories={currentCategories}
          />

          <AddProductPricingSection
            productType={productType}
            pricingType={pricingType}
            setPricingType={setPricingType}
            durationUnit={durationUnit}
            setDurationUnit={setDurationUnit}
            durationIsPlus={durationIsPlus}
            setDurationIsPlus={setDurationIsPlus}
            availabilityStatus={availabilityStatus}
            setAvailabilityStatus={setAvailabilityStatus}
            formData={formData}
            setFormData={setFormData}
            getDurationPreview={getDurationPreview}
          />

          <AddProductPricePreview
            productType={productType}
            getPricePreview={getPricePreview}
            getDurationPreview={getDurationPreview}
            canNego={formData.canNego}
          />

          <AddProductImagesSection productType={productType} images={images} setImages={setImages} />

          {productType === "barang" ? (
            <AddProductShippingSection
              formData={formData}
              setFormData={setFormData}
              shippingOptions={shippingOptions}
              setShippingOptions={setShippingOptions}
            />
          ) : (
            <AddProductServiceMethodSection
              formData={formData}
              setFormData={setFormData}
              shippingOptions={shippingOptions}
              setShippingOptions={setShippingOptions}
            />
          )}

          <AddProductActions
            productType={productType}
            submitDisabled={submitDisabled}
            onCancel={() => onNavigate("dashboard")}
          />
        </form>
      </div>
    </div>
  );
}
