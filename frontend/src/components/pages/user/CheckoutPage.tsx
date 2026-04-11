"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { mockAddresses } from "@/lib/mock-data";
import type { Address } from "@/lib/mock-data";
import AddressSection from "@/components/pages/user/checkout/AddressSection";
import CheckoutAddressDialogs from "@/components/pages/user/checkout/CheckoutAddressDialogs";
import CheckoutContactSellerCard from "@/components/pages/user/checkout/CheckoutContactSellerCard";
import CheckoutOrderSummaryColumn from "@/components/pages/user/checkout/CheckoutOrderSummaryColumn";
import CheckoutShippingMethodSection from "@/components/pages/user/checkout/CheckoutShippingMethodSection";
import ServiceBookingSection from "@/components/pages/user/checkout/ServiceBookingSection";
import {
  createDefaultAddressForm,
  formatPrice,
  getDisplayPrice,
  getShippingOptions,
  nextAddressSelection,
  resolveCheckoutProduct,
} from "@/components/pages/user/checkout/checkout.utils";
import type {
  CheckoutPageProps,
  NewAddressForm,
} from "@/components/pages/user/checkout/checkout.types";

export default function CheckoutPage({ onNavigate, productId }: CheckoutPageProps) {
  const { product, isService, isVariablePricing, defaultShippingMethod } = useMemo(
    () => resolveCheckoutProduct(productId),
    [productId],
  );

  const [shippingMethod, setShippingMethod] = useState<string>(defaultShippingMethod);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(mockAddresses[0]?.id || null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceRequirements, setServiceRequirements] = useState("");

  const [newAddress, setNewAddress] = useState<NewAddressForm>(createDefaultAddressForm());
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  useEffect(() => {
    setShippingMethod(defaultShippingMethod);
  }, [defaultShippingMethod]);

  const shippingOptions = useMemo(() => getShippingOptions(isService), [isService]);
  const selectedShipping = shippingOptions.find((option) => option.id === shippingMethod);

  const quantity = 1;
  const displayPrice = getDisplayPrice(product, isService);

  const isBookingDateMissing = isService && !bookingDate;
  const isServiceRequirementsMissing = isService && isVariablePricing && !serviceRequirements.trim();
  const isDeliveryAddressMissing = !isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0;

  const basePrice = isService ? (product.priceMin || product.price) : product.price;
  const shippingFee = shippingMethod === "delivery" ? 0 : 0;
  const totalPayment = basePrice + shippingFee;

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress(createDefaultAddressForm());
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
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
  };

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

  const handleDeleteAddress = (addressId: string) => {
    setAddresses((prev) => {
      const next = prev.filter((address) => address.id !== addressId);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(nextAddressSelection(prev, addressId));
      }
      return next;
    });
  };

  const handleSetPrimaryAddress = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isPrimary: address.id === addressId,
      })),
    );
  };

  const handleCreateOrder = () => {
    if (isService && !bookingDate) return;
    if (isService && isVariablePricing && !serviceRequirements.trim()) return;

    if (shippingMethod === "delivery" && !selectedAddressId && newAddress.address) {
      setShowSaveAddressDialog(true);
      return;
    }

    onNavigate("checkout-success", { successType: isService ? "service" : "product" });
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
                priceType={product.priceType}
                price={product.price}
                priceMin={product.priceMin}
                priceMax={product.priceMax}
                durationMin={product.durationMin}
                durationMax={product.durationMax}
                durationUnit={product.durationUnit}
                formatPrice={formatPrice}
              />
            )}

            {!isService && shippingMethod === "delivery" && (
              <AddressSection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                onAddNewAddress={handleAddNewAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetPrimaryAddress={handleSetPrimaryAddress}
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
              sellerName={product.seller.name}
              sellerPhone={product.seller.phone}
              onNavigate={onNavigate}
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
          />
        </div>
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
        onNavigate={onNavigate}
      />
    </div>
  );
}
