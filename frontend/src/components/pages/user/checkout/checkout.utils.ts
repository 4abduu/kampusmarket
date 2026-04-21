import type { Address, CheckoutProduct, NewAddressForm } from "@/components/pages/user/checkout/checkout.types";
import type {
  CheckoutResolvedProduct,
} from "@/components/pages/user/checkout/checkout.types";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const createDefaultAddressForm = (): NewAddressForm => ({
  label: "",
  recipient: "",
  phone: "",
  address: "",
  notes: "",
  saveToProfile: true,
});

export const resolveCheckoutProduct = (product: CheckoutProduct): CheckoutResolvedProduct => {
  const isService = product.type === "jasa";
  const isVariablePricing = isService && (product.priceType === "starting" || product.priceType === "range");

  return {
    product,
    isService,
    isVariablePricing,
    defaultShippingMethod: isService ? "pickup" : "cod",
  };
};

export const getDisplayPrice = (product: CheckoutProduct, isService: boolean) => {
  if (!isService) {
    return formatPrice(product.price || 0);
  }

  if (product.priceType === "starting") {
    return `Mulai ${formatPrice(product.price || 0)}`;
  }

  if (product.priceType === "range") {
    return `${formatPrice(product.priceMin || product.price || 0)} - ${formatPrice(product.priceMax || product.price || 0)}`;
  }

  return formatPrice(product.price || 0);
};

export const nextAddressSelection = (addresses: Address[], removedId: string) => {
  const remaining = addresses.filter((address) => address.id !== removedId);
  return remaining[0]?.id || null;
};
