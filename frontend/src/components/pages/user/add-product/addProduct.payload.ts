import type {
  AddProductFormData,
  AddProductPayload,
  AddProductShippingOptions,
  AvailabilityStatus,
  DurationUnit,
  PricingType,
  ProductType,
} from "@/components/pages/user/add-product/types";

const toInt = (value: string): number => parseInt(value || "0", 10) || 0;

const toPriceType = (pricingType: PricingType): "fixed" | "starting" | "range" => {
  if (pricingType === "mulai_dari") return "starting";
  if (pricingType === "rentang") return "range";
  return "fixed";
};

export const buildAddProductPayload = (
  productType: ProductType,
  pricingType: PricingType,
  durationUnit: DurationUnit,
  durationIsPlus: boolean,
  availabilityStatus: AvailabilityStatus,
  formData: AddProductFormData,
  shippingOptions: AddProductShippingOptions,
): AddProductPayload => {
  const payload: AddProductPayload = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    category_id: formData.category,
    type: productType,
    price_type: toPriceType(pricingType),
    price: toInt(formData.price),
    stock: toInt(formData.stock) || 1,
    can_nego: productType === "barang" ? formData.canNego : false,
    location: formData.location.trim(),
    is_cod: shippingOptions.isCod,
    is_pickup: shippingOptions.isPickup,
    is_delivery: shippingOptions.isDelivery,
    is_online: shippingOptions.isOnline,
    is_onsite: shippingOptions.isOnsite,
    is_home_service: shippingOptions.isHomeService,
  };

  if (formData.originalPrice) payload.original_price = toInt(formData.originalPrice);
  if (pricingType !== "tetap" && formData.priceMin) payload.price_min = toInt(formData.priceMin);
  if (pricingType === "rentang" && formData.priceMax) payload.price_max = toInt(formData.priceMax);

  if (productType === "barang") {
    payload.condition = formData.condition;
    if (formData.weight) payload.weight = toInt(formData.weight);
    if (shippingOptions.isDelivery) {
      payload.delivery_fee_min = shippingOptions.deliveryFeeMin;
      payload.delivery_fee_max = shippingOptions.deliveryFeeMax;
    }
  }

  if (productType === "jasa") {
    payload.availability_status = availabilityStatus;
    payload.duration_unit = durationUnit;
    payload.duration_is_plus = durationIsPlus;
    if (formData.durationMin) payload.duration_min = toInt(formData.durationMin);
    if (!durationIsPlus && formData.durationMax) payload.duration_max = toInt(formData.durationMax);
  }

  return payload;
};
