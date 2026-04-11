import type { ComponentType } from "react";
import type { NavigationData } from "@/app/navigation/types";
import type { Address, Product } from "@/lib/mock-data";

export interface CheckoutPageProps {
  onNavigate: (page: string, data?: NavigationData) => void;
  productId?: string;
}

export type CheckoutServiceMethod = "pickup" | "cod" | "online";
export type CheckoutProductMethod = "cod" | "pickup" | "delivery";

export interface CheckoutShippingOption {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
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
  product: Product;
  isService: boolean;
  isVariablePricing: boolean;
  defaultShippingMethod: CheckoutServiceMethod | CheckoutProductMethod;
}

export type AddressUpdater = (addresses: Address[]) => Address[];
