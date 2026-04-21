"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Truck, Home, Store, Monitor, Clock } from "lucide-react";
import { getProductDetail } from "@/lib/api/products";
import { createOrder } from "@/lib/api/orders";
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
} from "@/components/pages/user/checkout/checkout.types";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage({ onNavigate, productId }: CheckoutPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form fields
  const quantity = 1; // Fixed quantity for now
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

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProductDetail(productId);
        setProduct(data);
        // Set default shipping method to first available option from database
        const shippingOpts = (data as any).shippingOptions || (data as any).shipping_options || [];
        const firstShippingOption = shippingOpts[0];
        if (firstShippingOption) {
          setShippingMethod(String(firstShippingOption.type || firstShippingOption.id || ""));
        } else {
          // Fallback to default if no shipping options defined
          const isService = data.type === "jasa";
          setShippingMethod(isService ? "onsite" : "cod");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Gagal memuat detail produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
  const basePrice = product
    ? (isService ? (product?.priceMin || product?.price_min || product?.price || 0) : (product?.price || 0))
    : 0;
  const shippingFeeAmount = selectedShipping?.price || 0;
  const totalPayment = basePrice + shippingFeeAmount;

  const isBookingDateMissing = isService && !bookingDate;
  const isServiceRequirementsMissing = isService && isVariablePricing && !serviceRequirements.trim();
  const requiresAddress = ["delivery", "home_service"].includes(shippingMethod);
  const isDeliveryAddressMissing = requiresAddress && !selectedAddressId && addresses.length === 0;

  const handleSaveAddress = () => {
    if (!newAddress.label || !newAddress.recipient || !newAddress.address) return;

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((address) =>
          address.id === editingAddress.id
            ? {
                ...address,
                ...newAddress,
                phone: newAddress.phone || undefined,
                notes: newAddress.notes || undefined,
              }
            : address,
        ),
      );
    } else if (newAddress.saveToProfile) {
      const address: Address = {
        id: `a${Date.now()}`,
        userId: "1",
        label: newAddress.label,
        recipient: newAddress.recipient,
        phone: newAddress.phone || undefined,
        address: newAddress.address,
        notes: newAddress.notes || undefined,
        isPrimary: addresses.length === 0,
        createdAt: new Date().toISOString(),
      };

      setAddresses((prev) => [...prev, address]);
      setSelectedAddressId(address.id);
    }

    setShowAddressModal(false);
    setShowSaveAddressDialog(false);
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
      const productDbId = product?.uuid || product?.id;
      console.log('[CheckoutPage] Creating order...', { productId: productDbId, shippingType: selectedShipping.id, hasShippingOptions: !!normalizedShippingOpts.length });

      if (!productDbId) {
        setValidationError("ID produk tidak valid. Silakan muat ulang halaman.");
        return;
      }
      
      // Try to find a matching shipping option, but it's optional
      let shippingOptionId: string | undefined;
      let hasMatchingShippingType = false;
      if (normalizedShippingOpts.length) {
        const matched = normalizedShippingOpts.find((opt: any) => opt.key === selectedShipping.id);
        hasMatchingShippingType = !!matched;
        shippingOptionId = matched?.optionId;
      }
      
      if (!hasMatchingShippingType && normalizedShippingOpts.length) {
        // Error only when selected shipping type truly does not exist in DB options
        const msg = "Opsi pengiriman tidak valid. Shipping options yang tersedia: " + (normalizedShippingOpts.map((opt: any) => opt.key).join(", ") || "none");
        console.error('[CheckoutPage] No matching shipping option:', { selectedType: selectedShipping.id, availableOptions: normalizedShippingOpts });
        setValidationError(msg);
        return;
      }

      // Create order
      const orderPayload: any = {
        productId: productDbId,
        quantity,
        shippingType: selectedShipping.id,
        shippingNotes: "",
        selectedAddressId: requiresAddress ? selectedAddressId : undefined,
        serviceDate: isService ? bookingDate?.toISOString().split("T")[0] : undefined,
        serviceNotes: isService ? serviceNotes : undefined,
        paymentMethod: "midtrans",
        notes: isService ? serviceRequirements : undefined,
      };
      
      // Only add shippingOptionId if we found one
      if (shippingOptionId) {
        orderPayload.selectedShippingOptionId = shippingOptionId;
      }

      console.log('[CheckoutPage] Order payload:', orderPayload);
      const order = await createOrder(orderPayload);
      console.log('[CheckoutPage] Order created:', order);

      // Temporary simplified flow: after order creation, go directly to success page by type.
      const createdOrderId = order?.uuid || order?.id;
      if (createdOrderId) {
        onNavigate(isService ? "booking-success" : "payment-success", createdOrderId);
      } else {
        onNavigate(isService ? "booking-success" : "payment-success");
      }
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
                  onDeleteAddress={(addressId) => {
                    setAddresses((prev) => {
                      const next = prev.filter((address) => address.id !== addressId);
                      if (selectedAddressId === addressId) {
                        setSelectedAddressId(nextAddressSelection(prev, addressId));
                      }
                      return next;
                    });
                  }}
                  onSetPrimaryAddress={(addressId) => {
                    setAddresses((prev) =>
                      prev.map((address) => ({
                        ...address,
                        isPrimary: address.id === addressId,
                      })),
                    );
                  }}
                />
              )}

              <CheckoutShippingMethodSection
                isService={isService}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                shippingOptions={shippingOptions}
                selectedShipping={selectedShipping}
              />

              <CheckoutContactSellerCard
                sellerName={product.seller?.name || "Tidak diketahui"}
                sellerPhone={product.seller?.phone}
                onChat={() => onNavigate("chat", { productId: product?.id || product?.uuid, chatAction: "chat" })}
              />
            </div>

            <CheckoutOrderSummaryColumn
              product={product}
              isService={isService}
              quantity={quantity}
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
