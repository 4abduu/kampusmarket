import { useEffect, useMemo, useState } from "react";
import { getOrderDetail, type Order } from "@/lib/api/orders";
import { Package, MapPin, CreditCard, Home, MessageCircle, Clock, Calendar, Monitor } from "lucide-react";

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);

export const normalizeServiceMethod = (method: string): "pickup" | "cod" | "online" => {
  switch (method.toLowerCase()) {
    case "onsite":
    case "pickup":
      return "pickup";
    case "home_service":
    case "cod":
      return "cod";
    default:
      return "online";
  }
};

export const getServiceMethodLabel = (method: string) => {
  switch (method) {
    case "pickup":
      return { label: "Datang ke Lokasi", icon: Home, color: "bg-blue-100 text-blue-700" };
    case "cod":
      return { label: "Jasa Datang ke Lokasi", icon: MapPin, color: "bg-amber-100 text-amber-700" };
    case "online":
      return { label: "Online/Remote", icon: Monitor, color: "bg-purple-100 text-purple-700" };
    default:
      return { label: "Sesuai Kesepakatan", icon: Calendar, color: "bg-slate-100 text-slate-700" };
  }
};

export function extractOrderData(order: Order) {
  const isService = order.productType === "jasa" || (order as any)?.product_type === "jasa" || (order as any)?.product?.type === "jasa" || (order as any)?.product?.type === "JASA";
  const createdAt = (order as any)?.createdAt || (order as any)?.created_at;
  const serviceMethodRaw = String(
    (order as any)?.shippingType || (order as any)?.shipping_type || "online"
  );
  const serviceMethodKey = normalizeServiceMethod(serviceMethodRaw);

  const productTitle =
    (order as any)?.product?.title ||
    (order as any)?.productTitle ||
    (order as any)?.product_title ||
    "Produk";

  const productImages = Array.isArray((order as any)?.product?.images)
    ? (order as any).product.images
        .map((image: any) => (typeof image === "string" ? image : image?.url))
        .filter(Boolean)
    : [];
  
  const sellerName =
    (order as any)?.seller?.name ||
    (order as any)?.product?.seller?.name ||
    "Tidak diketahui";

  return {
    id: (order as any)?.uuid || (order as any)?.id || "",
    orderId:
      (order as any)?.orderNumber || (order as any)?.order_number || "-",
    orderDate: createdAt
      ? new Date(createdAt).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    isService,
    product: {
      id: order.product?.id || order.product?.uuid || "",
      title: productTitle,
      images: productImages,
      price: Number(
        (order as any)?.finalPrice || (order as any)?.final_price || 0
      ),
      quantity: Number((order as any)?.quantity || 1),
      seller: {
        name: sellerName,
        phone: (order as any)?.seller?.phone || "-",
        rating: isService ? Number((order as any)?.seller?.rating || 0) : undefined,
        totalOrders: isService ? Number((order as any)?.seller?.soldCount || 0) : undefined,
      },
    },
    shippingMethod: String(
      (order as any)?.shippingType ||
        (order as any)?.shipping_type ||
        "cod"
    ).toUpperCase(),
    paymentMethod: String(
      (order as any)?.paymentMethod ||
        (order as any)?.payment_method ||
        ""
    ).toUpperCase(),
    shippingAddress:
      (order as any)?.shippingAddress ||
      (order as any)?.shipping_address ||
      "-",
    subtotal: Number(
      (order as any)?.finalPrice || (order as any)?.final_price || 0
    ),
    shippingFee: Number(
      (order as any)?.shippingFee || (order as any)?.shipping_fee || 0
    ),
    total: Number(
      (order as any)?.totalPrice || (order as any)?.total_price || 0
    ),
    status: String((order as any)?.status || "pending"),
    serviceMethod: serviceMethodKey,
    schedule: isService ? {
      startDate: (order as any)?.serviceDate || "Sesuai kesepakatan",
      deadline: (order as any)?.serviceDeadline || "",
      time: (order as any)?.serviceTime || "",
    } : undefined,
    serviceNotes: isService ? ((order as any)?.serviceNotes || (order as any)?.service_notes || "") : undefined,
  };
}

export type ExtractedOrderData = ReturnType<typeof extractOrderData>;

export function useCheckoutSuccessful(orderId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const storedIds = localStorage.getItem("recentCheckoutOrderIds");
        let orderIds: string[] = [];

        if (storedIds) {
          try {
            orderIds = JSON.parse(storedIds);
          } catch {
            console.error("[useCheckoutSuccessful] Failed to parse recentCheckoutOrderIds");
          }
        }

        if (orderIds.length === 0 && orderId) {
          orderIds = [orderId];
        }

        if (orderIds.length === 0) {
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          orderIds.map((id) =>
            getOrderDetail(id).catch((err) => {
              console.error(`[useCheckoutSuccessful] Failed to fetch order ${id}`, err);
              return null;
            })
          )
        );

        const validOrders = results.filter(Boolean) as Order[];
        setOrders(validOrders);
      } catch (error) {
        console.error("[useCheckoutSuccessful] Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [orderId]);

  const isMultiOrder = orders.length > 1;
  const orderDataList = useMemo(
    () => orders.map(extractOrderData),
    [orders]
  );
  const firstOrderData = orderDataList[0];

  const getNextSteps = () => {
    const data = firstOrderData;
    if (!data) return [];
    
    if (data.isService) {
      return [
        { icon: Clock, text: "Tunggu konfirmasi dari penyedia jasa" },
        { icon: MessageCircle, text: "Penyedia jasa akan menghubungi via WhatsApp" },
        { icon: Calendar, text: "Tentukan jadwal dan waktu layanan" },
        { icon: CreditCard, text: "Selesaikan pembayaran" },
      ];
    } else {
      const method = data.shippingMethod || "COD";
      switch (method) {
        case "COD":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: MessageCircle, text: "Penjual akan menghubungi via WhatsApp" },
            { icon: MapPin, text: "Tentukan lokasi dan waktu ketemuan" },
            { icon: CreditCard, text: "Bayar tunai saat bertemu" },
          ];
        case "PICKUP":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: MessageCircle, text: "Hubungi penjual untuk jadwal ambil" },
            { icon: Home, text: "Ambil barang di lokasi penjual" },
            { icon: CreditCard, text: "Bayar di tempat atau transfer" },
          ];
        case "DELIVERY":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: CreditCard, text: "Penjual akan update status pengiriman" },
            { icon: Package, text: "Barang diantar ke alamatmu" },
            { icon: MessageCircle, text: "Konfirmasi saat barang diterima" },
          ];
        default:
          return [{ icon: Clock, text: "Tunggu update dari penjual" }];
      }
    }
  };

  const isServiceOrder = firstOrderData?.isService ?? false;
  const isProductOrder = !isServiceOrder && firstOrderData !== undefined;

  return {
    orders,
    loading,
    isMultiOrder,
    orderDataList,
    firstOrderData,
    getNextSteps,
    isServiceOrder,
    isProductOrder
  };
}
