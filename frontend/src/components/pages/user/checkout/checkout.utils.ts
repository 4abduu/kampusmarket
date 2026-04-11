import { Home, Monitor, Truck, Wallet } from "lucide-react";
import { mockProducts, mockServices } from "@/lib/mock-data";
import type { Address, Product } from "@/lib/mock-data";
import type {
  CheckoutResolvedProduct,
  CheckoutShippingOption,
  NewAddressForm,
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

export const resolveCheckoutProduct = (productId?: string): CheckoutResolvedProduct => {
  let product = mockProducts.find((item) => item.id === productId);

  if (!product) {
    const service = mockServices.find((item) => item.id === productId);

    if (service) {
      product = {
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        price: service.price,
        priceMin: service.priceMin,
        priceMax: service.priceMax,
        priceType: service.priceType,
        category: service.category,
        categoryId: service.categoryId,
        images: service.images,
        seller: service.provider,
        sellerId: service.provider.id,
        location: service.location,
        stock: 999,
        canNego: service.canNego,
        isCod: false,
        isPickup: true,
        isDelivery: false,
        shippingOptions: [],
        createdAt: service.createdAt,
        views: 0,
        rating: service.rating,
        reviewCount: service.reviewCount,
        soldCount: service.orderCount,
        durationMin: service.durationMin,
        durationMax: service.durationMax,
        durationUnit: service.durationUnit,
        type: "jasa",
        status: "active",
      } satisfies Product;
    }
  }

  if (!product) {
    product = mockProducts[0];
  }

  const isService = product.type === "jasa";
  const isVariablePricing = isService && (product.priceType === "starting" || product.priceType === "range");

  return {
    product,
    isService,
    isVariablePricing,
    defaultShippingMethod: isService ? "pickup" : "cod",
  };
};

export const getDisplayPrice = (product: Product, isService: boolean) => {
  if (!isService) {
    return formatPrice(product.price);
  }

  if (product.priceType === "starting") {
    return `Mulai ${formatPrice(product.price)}`;
  }

  if (product.priceType === "range") {
    return `${formatPrice(product.priceMin || product.price)} - ${formatPrice(product.priceMax || product.price)}`;
  }

  return formatPrice(product.price);
};

export const getShippingOptions = (isService: boolean): CheckoutShippingOption[] => {
  if (isService) {
    return [
      {
        id: "pickup",
        label: "Datang ke Lokasi",
        description: "Pergi ke lokasi penyedia jasa",
        icon: Home,
        info: {
          title: "Layanan di Lokasi Penyedia",
          description: "Kamu akan datang ke lokasi penyedia jasa sesuai jadwal yang disepakati. Pembayaran bisa di tempat atau transfer.",
          color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800",
        },
      },
      {
        id: "cod",
        label: "Jasa Datang ke Lokasi",
        description: "Penyedia jasa datang ke lokasimu",
        icon: Wallet,
        info: {
          title: "Layanan di Lokasi Kamu",
          description: "Penyedia jasa akan datang ke lokasimu. Pembayaran bisa di tempat atau transfer.",
          color: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800",
        },
      },
      {
        id: "online",
        label: "Online/Remote",
        description: "Layanan dilakukan secara online",
        icon: Monitor,
        info: {
          title: "Layanan Online",
          description: "Layanan dilakukan secara online/remote. Pembayaran via transfer sebelum atau sesudah layanan.",
          color: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800",
        },
      },
    ];
  }

  return [
    {
      id: "cod",
      label: "COD (Cash on Delivery)",
      description: "Bayar tunai saat ketemuan dengan penjual",
      icon: Wallet,
      info: {
        title: "Pembayaran di Tempat",
        description: "Kamu akan membayar langsung kepada penjual saat bertemu. Tidak perlu pembayaran online.",
        color: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800",
      },
    },
    {
      id: "pickup",
      label: "Ambil Sendiri",
      description: "Ambil barang di lokasi penjual",
      icon: Home,
      info: {
        title: "Ambil di Lokasi Penjual",
        description: "Hubungi penjual untuk jadwal pengambilan. Pembayaran bisa di tempat atau transfer.",
        color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800",
      },
    },
    {
      id: "delivery",
      label: "Antar Manual",
      description: "Penjual mengantar ke alamatmu",
      icon: Truck,
      info: {
        title: "Menunggu Konfirmasi Ongkir",
        description: "Penjual akan menghubungi dan menentukan ongkir. Kamu akan membayar setelah ongkir dikonfirmasi.",
        color: "bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800",
      },
    },
  ];
};

export const nextAddressSelection = (addresses: Address[], removedId: string) => {
  const remaining = addresses.filter((address) => address.id !== removedId);
  return remaining[0]?.id || null;
};
