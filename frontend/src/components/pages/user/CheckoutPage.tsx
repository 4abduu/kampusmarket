"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Truck, Home, Store, Monitor, Clock } from "lucide-react";
import { getProductDetail } from "@/lib/api/products";
import { createOrder } from "@/lib/api/orders";
import { getAddresses, createAddress, updateAddress, deleteAddress, setPrimaryAddress } from "@/lib/api/addresses";
import AddressSection from "@/components/pages/user/checkout/AddressSection";
import CheckoutAddressDialogs from "@/components/pages/user/checkout/CheckoutAddressDialogs";
import CheckoutContactSellerCard from "@/components/pages/user/checkout/CheckoutContactSellerCard";
import CheckoutOrderSummaryColumn from "@/components/pages/user/checkout/CheckoutOrderSummaryColumn";
import CheckoutShippingMethodSection from "@/components/pages/user/checkout/CheckoutShippingMethodSection";
import ServiceBookingSection from "@/components/pages/user/checkout/ServiceBookingSection";
import CheckoutPageSkeleton from "@/components/skeleton/CheckoutPageSkeleton";
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

  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceRequirements, setServiceRequirements] = useState("");

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
            return { product: data, quantity: item.quantity };
          })
        );

        setCheckoutItems(resolvedItems);
        
        // SUCCESS: Now we can clear localStorage
        if (stored) {
          localStorage.removeItem("checkoutCartItems");
        }
        
        // Use first item to set default shipping method
        const firstProduct = resolvedItems[0].product;
        const shippingOpts = (firstProduct as any).shippingOptions || (firstProduct as any).shipping_options || [];
        const firstShippingOption = shippingOpts[0];
        if (firstShippingOption) {
          setShippingMethod(String(firstShippingOption.type || firstShippingOption.id || ""));
        } else {
          setShippingMethod(firstProduct.type === "jasa" ? "onsite" : "cod");
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

  // Derived values
  const isService = product?.type === "jasa";
  const priceType = product?.priceType || product?.price_type;
  const isVariablePricing = isService && (priceType === "starting" || priceType === "range");
  
  // Get shipping options from product database (not hardcoded)
  const shippingOpts = (product as any)?.shippingOptions || (product as any)?.shipping_options || [];

  const normalizedShippingOpts = shippingOpts
    .map((opt: any) => ({
      key: String(opt.type || opt.id || ""),
      optionId: String(opt.uuid || opt.id || ""),
      label: String(opt.label || opt.name || "Metode"),
      price: Number(opt.price || 0),
      raw: opt,
    }))
    .filter((opt: any) => opt.key);
  
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

  const isBookingDateMissing = isService && !bookingDate;
  const isServiceRequirementsMissing = isService && isVariablePricing && !serviceRequirements.trim();
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

  const handleCreateOrder = async () => {
    // Clear previous validation errors
    setValidationError(null);

    if (isService && !bookingDate) {
      const msg = "Tanggal booking harus dipilih";
      console.warn('[CheckoutPage] Validation error:', msg);
      setValidationError(msg);
      return;
    }
    if (isService && isVariablePricing && !serviceRequirements.trim()) {
      const msg = "Deskripsi kebutuhan harus diisi";
      console.warn('[CheckoutPage] Validation error:', msg);
      setValidationError(msg);
      return;
    }
    if (requiresAddress && !selectedAddressId && addresses.length === 0) {
      console.log('[CheckoutPage] No address selected, showing dialog');
      setShowSaveAddressDialog(true);
      return;
    }

    if (!product || !selectedShipping) {
      const msg = "Silakan pilih metode pengiriman";
      console.warn('[CheckoutPage] Validation error:', msg, { product: !!product, selectedShipping: !!selectedShipping });
      setValidationError(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      let lastOrderId = "";
      
      // Loop through all items to create orders
      for (const item of checkoutItems) {
        const itemProduct = item.product;
        const productDbId = itemProduct?.uuid || itemProduct?.id;

        if (!productDbId) continue;
        
        // Find shipping option for this specific product if possible, 
        // otherwise use the general selectedShipping
        const itemShippingOpts = (itemProduct as any).shippingOptions || (itemProduct as any).shipping_options || [];
        let shippingOptionId: string | undefined;
        
        if (itemShippingOpts.length) {
          const matched = itemShippingOpts.find((opt: any) => 
            (opt.type || opt.id) === selectedShipping?.id
          );
          shippingOptionId = matched?.uuid || matched?.id;
        }

        const orderPayload: any = {
          productId: productDbId,
          quantity: item.quantity,
          negoPrice: (checkoutItems.length === 1 && negotiatedPrice) ? negotiatedPrice : undefined,
          shippingType: selectedShipping?.id,
          shippingNotes: "",
          selectedAddressId: requiresAddress ? selectedAddressId : undefined,
          serviceDate: isService ? bookingDate?.toISOString().split("T")[0] : undefined,
          serviceNotes: isService ? serviceNotes : undefined,
          paymentMethod: "midtrans",
          notes: isService ? serviceRequirements : undefined,
          selectedShippingOptionId: shippingOptionId,
        };

        console.log(`[CheckoutPage] Creating order for product ${productDbId}...`, orderPayload);
        const order = await createOrder(orderPayload);
        lastOrderId = order?.uuid || order?.id || "";
      }

      console.log('[CheckoutPage] All orders created successfully');
      
      // Navigate to success page
      onNavigate(isService ? "booking-success" : "payment-success", lastOrderId);

    } catch (err: any) {
      const backendMessage = err?.message;
      const backendErrors = err?.errors ? Object.values(err.errors).flat().join(" | ") : "";
      const msg = backendErrors || backendMessage || "Gagal membuat pesanan. Silakan coba lagi.";
      console.error("[CheckoutPage] Order creation error:", err);
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
              {/* Multiple Items Warning */}
              {isMultipleItems && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 text-amber-600 shrink-0 mt-0.5">⚠️</div>
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Cara Kirim & Pembayaran Sama untuk Semua Item
                        </p>
                        <p className="text-amber-700 dark:text-amber-300">
                          Karena Anda membeli dari seller berbeda, metode pengiriman dan pembayaran akan diterapkan pada semua item dalam 1 order. Kalau ingin cara kirim beda per seller, silakan checkout satu per satu.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isService && (
                <ServiceBookingSection
                  bookingDate={bookingDate}
                  deadlineDate={deadlineDate}
                  setBookingDate={setBookingDate}
                  setDeadlineDate={setDeadlineDate}
                  serviceNotes={serviceNotes}
                  setServiceNotes={setServiceNotes}
                  isVariablePricing={isVariablePricing}
                  serviceRequirements={serviceRequirements}
                  setServiceRequirements={setServiceRequirements}
                  priceType={product.priceType || product.price_type}
                  price={product.price}
                  priceMin={product.priceMin || product.price_min}
                  priceMax={product.priceMax || product.price_max}
                  durationMin={product.durationMin || product.duration_min}
                  durationMax={product.durationMax || product.duration_max}
                  durationUnit={product.durationUnit || product.duration_unit}
                  formatPrice={formatPrice}
                />
              )}

              {!isService && shippingMethod === "delivery" && (
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
                  phone: item.product.seller?.phone
                }))}
                onChat={(sellerId) => onNavigate("chat", { productId: sellerId, chatAction: "chat" })}
              />
            </div>

            <CheckoutOrderSummaryColumn
              product={product}
              isService={isService}
              quantity={checkoutItems[0]?.quantity || 1}
              displayPrice={displayPrice}
              bookingDate={bookingDate}
              serviceNotes={serviceNotes}
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
