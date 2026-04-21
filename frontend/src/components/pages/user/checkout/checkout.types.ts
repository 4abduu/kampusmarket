import type { ComponentType } from "react";
import type { NavigationData } from "@/app/navigation/types";

export interface CheckoutSeller {
  id?: string;
  name?: string;
  phone?: string;
}

export interface CheckoutProduct {
  id?: string;
  uuid?: string;
  title: string;
  type?: "barang" | "jasa";
  price?: number;
  priceMin?: number;
  priceMax?: number;
  priceType?: "fixed" | "starting" | "range";
  durationMin?: number;
  durationMax?: number;
  durationUnit?: string;
  seller?: CheckoutSeller;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipient: string;
  phone?: string;
  address: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CheckoutPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  productId?: string;
}

export type CheckoutServiceMethod = "pickup" | "cod" | "online";
export type CheckoutProductMethod = "cod" | "pickup" | "delivery";

export interface CheckoutShippingOption {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  price: number;
  optionId?: string;
  info: {
    title: string;
    description: string;
    color: string;
  };
}

export interface NewAddressForm {
  label: string;
  recipient: string;
  phone: string;
  address: string;
  notes: string;
  saveToProfile: boolean;
}

export interface CheckoutResolvedProduct {
  product: CheckoutProduct;
  isService: boolean;
  isVariablePricing: boolean;
  defaultShippingMethod: CheckoutServiceMethod | CheckoutProductMethod;
}

export type AddressUpdater = (addresses: Address[]) => Address[];
