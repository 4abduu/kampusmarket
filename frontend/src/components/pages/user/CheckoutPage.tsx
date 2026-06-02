"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Truck, Home, Store, Monitor, Clock, Briefcase } from "lucide-react";
import { getProductDetail } from "@/lib/api/products";
import { createOrder } from "@/lib/api/orders";
import { removeFromCart } from "@/lib/api/cart";
import { getAddresses, createAddress, updateAddress, deleteAddress, setPrimaryAddress } from "@/lib/api/addresses";

import AddressSection from "@/components/pages/user/checkout/AddressSection";
import CheckoutAddressDialogs from "@/components/pages/user/checkout/CheckoutAddressDialogs";
import CheckoutContactSellerCard from "@/components/pages/user/checkout/CheckoutContactSellerCard";
import CheckoutOrderSummaryColumn from "@/components/pages/user/checkout/CheckoutOrderSummaryColumn";
import CheckoutShippingMethodSection from "@/components/pages/user/checkout/CheckoutShippingMethodSection";
import ServiceBookingSection from "@/components/pages/user/checkout/ServiceBookingSection";
import { getCommonMethods } from "@/lib/checkout-validation";
import { CheckoutPageSkeleton } from "@/components/skeleton";
import {
  createDefaultAddressForm,
  formatPrice,
  getDisplayPrice,
  nextAddressSelection,
} from "@/components/pages/user/checkout/checkout.utils";
import type {
  CheckoutPageProps,
  NewAddressForm,
  CheckoutShippingOption,
  Address,
  CartItem,
} from "@/components/pages/user/checkout/checkout.types";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage({ onNavigate, productId }: CheckoutPageProps) {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<{ product: any; quantity: number }[]>([]);

  // [NEW] negotiated price dari offer/nego dalam chat
  const negotiatedPrice = searchParams.get("price") ? parseInt(searchParams.get("price") || "0", 10) : null;

  // State for form fields
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  interface ServiceDetail {
    bookingDate?: Date;
    deadlineDate?: Date;
    serviceNotes: string;
    serviceRequirements: string;
  }
  const [serviceDetails, setServiceDetails] = useState<Record<string, ServiceDetail>>({});

  const updateServiceDetail = (productId: string, field: keyof ServiceDetail, value: any) => {
    setServiceDetails(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { serviceNotes: "", serviceRequirements: "" }),
        [field]: value
      }
    }));
  };

  const [newAddress, setNewAddress] = useState<NewAddressForm>(createDefaultAddressForm());
  const [addresses, setAddresses] = useState<Address[]>([]);

  const product = checkoutItems[0]?.product;
  const isMultipleItems = checkoutItems.length > 1;

  // Fetch product data on mount
  useEffect(() => {
    const fetchCheckoutData = async () => {
      setLoading(true);
      setError(null);

      try {
        let items: CartItem[] = [];
        
        // 1. Coba dari localStorage (CartPage flow)
        const stored = localStorage.getItem("checkoutCartItems");
        if (stored) {
          try {
            items = JSON.parse(stored);
            // Don't remove yet to handle StrictMode double-mount in dev
          } catch (e) {
            console.error("Failed to parse checkoutCartItems", e);
          }
        }
        
        // 2. Jika kosong, coba dari props (Direct buy flow)
        if (items.length === 0 && productId) {
          items = [{ productId, quantity: 1 }];
        }

        if (items.length === 0) {
          console.warn("[CheckoutPage] No items found in localStorage or props");
          setError("Tidak ada item untuk checkout. Silakan kembali ke keranjang.");
          setLoading(false);
          return;
        }

        // Fetch all products
        const resolvedItems = await Promise.all(
          items.map(async (item) => {
            const data = await getProductDetail(item.productId);
            return { product: data, quantity: item.quantity, cartItemId: (item as any).cartItemId };
          })
        );

        setCheckoutItems(resolvedItems);
        
        // We DON'T remove localStorage here so that page refreshes work.
        // It will be removed after a successful checkout.
        
        // Use intersected items to set default shipping method
        const intersectedTypes = getCommonMethods(resolvedItems as any);

        if (intersectedTypes.length > 0) {
          setShippingMethod(intersectedTypes[0]);
        } else {
          setShippingMethod("");
        }

      } catch (err) {
        console.error("Failed to fetch checkout items:", err);
        setError("Gagal memuat detail produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [productId]);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAddresses();
        const data = response.data || response;
        setAddresses(data);
        // Auto-select primary address if any
        const primary = data.find((a: any) => a.isPrimary);
        if (primary) setSelectedAddressId(primary.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  const isService = product?.type === "jasa";

  
  // Calculate intersected shipping types across all products
  const intersectedShippingTypes = getCommonMethods(checkoutItems as any);

  const hasShippingIntersection = checkoutItems.length === 0 || intersectedShippingTypes.length > 0;

  const getFallbackLabel = (type: string) => {
    switch (type) {
      case 'cod': return 'COD / Bayar di Tempat';
      case 'pickup': return 'Ambil Sendiri';
      case 'delivery': return 'Antar ke Lokasi';
      case 'online': return 'Layanan Online';
      case 'onsite': return 'Datang ke Lokasi Provider';
      case 'home_service': return 'Provider Datang ke Lokasi';
      default: return 'Metode Pengiriman';
    }
  };

  const normalizedShippingOpts = intersectedShippingTypes.map(type => {
    let label = getFallbackLabel(type);
    let optionId = type;
    let totalPrice = 0;
    
    for (const item of checkoutItems) {
      const itemShippingOpts = (item.product as any)?.shippingOptions || (item.product as any)?.shipping_options || [];
      const opt = itemShippingOpts.find((o: any) => String(o.type || o.id || "") === type);
      if (opt) {
        if (opt.label || opt.name) {
          label = String(opt.label || opt.name);
          optionId = String(opt.uuid || opt.id || type);
        }
        totalPrice += Number(opt.price || 0) * item.quantity;
      }
    }

    return {
      key: type,
      optionId,
      label,
      price: totalPrice,
      raw: null,
    };
  });
  
  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'delivery':
      case 'home_service':
        return Truck;
      case 'pickup':
        return Store;
      case 'online':
        return Monitor;
      case 'cod':
        return Home;
      default:
        return Clock;
    }
  };
  
  const shippingOptions: CheckoutShippingOption[] = normalizedShippingOpts.length
    ? normalizedShippingOpts.map((opt: any) => ({
        id: opt.key,
        label: opt.label,
        description: `Rp ${opt.price.toLocaleString("id-ID")}`,
        price: opt.price,
        optionId: opt.optionId,
        icon: getIconForType(opt.key),
        info: {
          title: opt.label,
          description: `Biaya: Rp ${opt.price.toLocaleString("id-ID")}`,
          color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800",
        },
      }))
    : [];
  
  const selectedShipping = shippingOptions.find((option) => option.id === shippingMethod);

  const displayPrice = product ? getDisplayPrice(product, isService) : "Rp 0";
  // [NEW] Use negotiated price if available (from offer/nego in chat) for single item, 
  // otherwise use the sum of all products in checkoutItems
  const subtotal = checkoutItems.reduce((sum, item) => {
    const itemPrice = (item.product.priceMin || item.product.price_min || item.product.price || 0);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const basePrice = (negotiatedPrice !== null && checkoutItems.length === 1)
    ? negotiatedPrice
    : subtotal;

  const shippingFeeAmount = selectedShipping?.price || 0;
  const totalPayment = basePrice + shippingFeeAmount;

  // Validation checks
  const isBookingDateMissing = isService && checkoutItems.some(item => {
    const details = serviceDetails[item.product.id || item.product.uuid];
    return !details?.bookingDate;
  });

  const isServiceRequirementsMissing = isService && checkoutItems.some(item => {
    const pType = item.product.priceType || item.product.price_type;
    const isVar = pType === "starting" || pType === "range";
    const details = serviceDetails[item.product.id || item.product.uuid];
    return isVar && !(details?.serviceRequirements?.trim());
  });

  const requiresAddress = ["delivery", "home_service"].includes(shippingMethod);
  const isDeliveryAddressMissing = requiresAddress && !selectedAddressId && addresses.length === 0;

  const handleSaveAddress = async () => {
    if (!newAddress.label || !newAddress.recipient || !newAddress.address) return;

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, {
          label: newAddress.label,
          recipient: newAddress.recipient,
          phone: newAddress.phone,
          address: newAddress.address,
          notes: newAddress.notes,
          is_primary: editingAddress.isPrimary,
        });
      } else {
        const response = await createAddress({
          label: newAddress.label,
          recipient: newAddress.recipient,
          phone: newAddress.phone,
          address: newAddress.address,
          notes: newAddress.notes,
          is_primary: addresses.length === 0,
        });
        const savedAddress = response.data || response;
        setAddresses((prev) => [...prev, savedAddress]);
        setSelectedAddressId(savedAddress.id);
      }

      // Refresh addresses list
      const response = await getAddresses();
      setAddresses(response.data || response);

      setShowAddressModal(false);
      setShowSaveAddressDialog(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      setValidationError("Gagal menyimpan alamat. Silakan coba lagi.");
    }
  };

  // Create order - langsung tanpa dialog metode pembayaran
  const handleCreateOrder = async () => {
    // Clear validation errors
    setValidationError(null);

    if (isBookingDateMissing) {
      setValidationError("Tanggal booking harus dipilih untuk semua jasa");
      return;
    }
    if (isServiceRequirementsMissing) {
      setValidationError("Deskripsi kebutuhan harus diisi untuk semua jasa dengan harga fleksibel");
      return;
    }
    if (requiresAddress && !selectedAddressId && addresses.length === 0) {
      setShowSaveAddressDialog(true);
      return;
    }
    if (!hasShippingIntersection) {
      setValidationError("Tidak ada metode pengiriman yang tersedia untuk kombinasi produk ini");
      return;
    }
    if (!product || !selectedShipping) {
      setValidationError("Silakan pilih metode pengiriman");
      return;
    }

    setIsSubmitting(true);
    const successfulOrderIds: string[] = [];
    const failedItems: { title: string; reason: string }[] = [];

    for (const item of checkoutItems) {
      const itemProduct = item.product;
      const productDbId = itemProduct?.uuid || itemProduct?.id;
      const productTitle = (itemProduct as any)?.title || (itemProduct as any)?.name || "Produk";

      if (!productDbId) continue;

      const itemShippingOpts = (itemProduct as any).shippingOptions || (itemProduct as any).shipping_options || [];
      let shippingOptionId: string | undefined;

      if (itemShippingOpts.length) {
        const matched = itemShippingOpts.find((opt: any) =>
          (opt.type || opt.id) === selectedShipping?.id
        );
        shippingOptionId = matched?.uuid || matched?.id;
      }

      const details = serviceDetails[productDbId] || {};

      const orderPayload: any = {
        productId: productDbId,
        quantity: item.quantity,
        negoPrice: (checkoutItems.length === 1 && negotiatedPrice) ? negotiatedPrice : undefined,
        shippingType: selectedShipping?.id,
        shippingNotes: "",
        selectedAddressId: requiresAddress ? selectedAddressId : undefined,
        serviceDate: isService && details.bookingDate ? details.bookingDate.toISOString().split("T")[0] : undefined,
        serviceDeadline: isService && details.deadlineDate ? details.deadlineDate.toISOString().split("T")[0] : undefined,
        serviceNotes: isService ? details.serviceNotes : undefined,
        notes: isService ? details.serviceRequirements : undefined,
        selectedShippingOptionId: shippingOptionId,
      };

      try {
        const order = await createOrder(orderPayload);
        const orderId = order?.uuid || order?.id || "";
        if (orderId) successfulOrderIds.push(orderId);
      } catch (err: any) {
        const reason = err?.message || "Gagal membuat pesanan";
        failedItems.push({ title: productTitle, reason });
      }
    }

    if (successfulOrderIds.length > 0) {
      // Remove successfully checked out items from cart
      for (const item of checkoutItems) {
        if ((item as any).cartItemId) {
          try {
            await removeFromCart((item as any).cartItemId);
          } catch (e) {
            console.error("Failed to remove item from cart", e);
          }
        }
      }
      
      // Set recent orders in localStorage for the success page to pick up
      localStorage.setItem("recentCheckoutOrderIds", JSON.stringify(successfulOrderIds));
      localStorage.removeItem("checkoutCartItems"); // Clear checkout items
      onNavigate("checkout-success");
    } else {
      const reasons = failedItems.map(f => f.reason).filter((v, i, a) => a.indexOf(v) === i);
      const msg = reasons.join(" | ") || "Gagal membuat pesanan. Silakan coba lagi.";
      setValidationError(msg);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => onNavigate("landing")} className="hover:text-primary-600">
            Beranda
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => onNavigate("cart")} className="hover:text-primary-600">
            Keranjang
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Checkout</span>
        </nav>

        {loading && (
          <CheckoutPageSkeleton />
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => onNavigate("landing")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Kembali ke Beranda
              </button>
            </CardContent>
          </Card>
        )}

        {validationError && !loading && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 mb-6">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Kesalahan Validasi</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{validationError}</p>
                </div>
                <button
                  onClick={() => setValidationError(null)}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  ✕
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && product && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Multiple Items Warning / Error */}
              {isMultipleItems && !hasShippingIntersection && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 text-red-600 shrink-0 mt-0.5">❌</div>
                      <div className="text-sm">
                        <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                          Metode Pengiriman Tidak Tersedia
                        </p>
                        <p className="text-red-700 dark:text-red-300">
                          Tidak ada metode pengiriman yang didukung oleh semua produk dalam keranjang. Silakan checkout produk secara terpisah.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {isMultipleItems && hasShippingIntersection && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 text-amber-600 shrink-0 mt-0.5">⚠️</div>
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Cara Kirim & Pembayaran Sama untuk Semua Item
                        </p>
                        <p className="text-amber-700 dark:text-amber-300">
                          Karena Anda membeli lebih dari satu item, metode pengiriman yang ditampilkan hanyalah opsi yang didukung oleh SEMUA produk. Harga ongkir adalah total dari semua produk.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isService && checkoutItems.map((item, index) => {
                const itemProduct = item.product;
                const productId = itemProduct.id || itemProduct.uuid;
                const details = serviceDetails[productId] || { serviceNotes: "", serviceRequirements: "" };
                const pType = itemProduct.priceType || itemProduct.price_type;
                const isVar = pType === "starting" || pType === "range";
                
                return (
                  <div key={productId} className={index > 0 ? "mt-6" : ""}>
                    {isMultipleItems && (
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        {itemProduct.title}
                      </h3>
                    )}
                    <ServiceBookingSection
                      bookingDate={details.bookingDate}
                      deadlineDate={details.deadlineDate}
                      setBookingDate={(val) => updateServiceDetail(productId, "bookingDate", val)}
                      setDeadlineDate={(val) => updateServiceDetail(productId, "deadlineDate", val)}
                      serviceNotes={details.serviceNotes}
                      setServiceNotes={(val) => updateServiceDetail(productId, "serviceNotes", val)}
                      isVariablePricing={isVar}
                      serviceRequirements={details.serviceRequirements}
                      setServiceRequirements={(val) => updateServiceDetail(productId, "serviceRequirements", val)}
                      priceType={pType}
                      price={itemProduct.price}
                      priceMin={itemProduct.priceMin || itemProduct.price_min}
                      priceMax={itemProduct.priceMax || itemProduct.price_max}
                      durationMin={itemProduct.durationMin || itemProduct.duration_min}
                      durationMax={itemProduct.durationMax || itemProduct.duration_max}
                      durationUnit={itemProduct.durationUnit || itemProduct.duration_unit}
                      formatPrice={formatPrice}
                    />
                  </div>
                );
              })}

              {requiresAddress && (
                <AddressSection
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  setSelectedAddressId={setSelectedAddressId}
                  onAddNewAddress={() => {
                    setEditingAddress(null);
                    setNewAddress(createDefaultAddressForm());
                    setShowAddressModal(true);
                  }}
                  onEditAddress={(address) => {
                    setEditingAddress(address);
                    setNewAddress({
                      label: address.label,
                      recipient: address.recipient,
                      phone: address.phone || "",
                      address: address.address,
                      notes: address.notes || "",
                      saveToProfile: true,
                    });
                    setShowAddressModal(true);
                  }}
                  onDeleteAddress={async (addressId) => {
                    try {
                      await deleteAddress(addressId);
                      setAddresses((prev) => {
                        const next = prev.filter((address) => address.id !== addressId);
                        if (selectedAddressId === addressId) {
                          setSelectedAddressId(nextAddressSelection(prev, addressId));
                        }
                        return next;
                      });
                    } catch (err) {
                      console.error("Failed to delete address:", err);
                    }
                  }}
                  onSetPrimaryAddress={async (addressId) => {
                    try {
                      await setPrimaryAddress(addressId);
                      setAddresses((prev) =>
                        prev.map((address) => ({
                          ...address,
                          isPrimary: address.id === addressId,
                        })),
                      );
                    } catch (err) {
                      console.error("Failed to set primary address:", err);
                    }
                  }}
                />
              )}

              <CheckoutShippingMethodSection
                isService={isService}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                shippingOptions={shippingOptions}
                selectedShipping={selectedShipping}
                isMultipleItems={isMultipleItems}
              />

              <CheckoutContactSellerCard
                sellers={checkoutItems.map(item => ({
                  id: item.product.seller?.uuid || item.product.seller?.id,
                  name: item.product.seller?.name || "Tidak diketahui",
                  phone: item.product.seller?.phone,
                  productId: item.product.id || item.product.uuid,
                }))}
                onChat={(productId) => onNavigate("chat", { productId, chatAction: "chat" })}
              />
            </div>

            <CheckoutOrderSummaryColumn
              product={product}
              isService={isService}
              quantity={checkoutItems[0]?.quantity || 1}
              displayPrice={displayPrice}
              bookingDate={!isMultipleItems ? serviceDetails[checkoutItems[0]?.product?.id || checkoutItems[0]?.product?.uuid]?.bookingDate : undefined}
              serviceNotes={!isMultipleItems ? serviceDetails[checkoutItems[0]?.product?.id || checkoutItems[0]?.product?.uuid]?.serviceNotes || "" : ""}
              shippingMethod={shippingMethod}
              basePrice={basePrice}
              totalPayment={totalPayment}
              formatPrice={formatPrice}
              handleCreateOrder={handleCreateOrder}
              isBookingDateMissing={isBookingDateMissing}
              isServiceRequirementsMissing={isServiceRequirementsMissing}
              isDeliveryAddressMissing={isDeliveryAddressMissing}
              selectedAddressId={selectedAddressId}
              addresses={addresses}
              isSubmitting={isSubmitting}
              negotiatedPrice={negotiatedPrice}
              checkoutItems={checkoutItems}
              isMultipleItems={isMultipleItems}
            />
          </div>
        )}
      </div>

      <CheckoutAddressDialogs
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        showSaveAddressDialog={showSaveAddressDialog}
        setShowSaveAddressDialog={setShowSaveAddressDialog}
        editingAddress={editingAddress}
        newAddress={newAddress}
        setNewAddress={setNewAddress}
        handleSaveAddress={handleSaveAddress}
      />
    </div>
  );
}
