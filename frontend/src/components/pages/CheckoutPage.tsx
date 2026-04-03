"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  MapPin,
  Truck,
  User,
  Wallet,
  ChevronRight,
  Shield,
  AlertCircle,
  Clock,
  MessageCircle,
  Home,
  Phone,
  Info,
  Plus,
  Check,
  Building,
  MapPinned,
  Trash2,
  Edit,
  CalendarIcon,
  CalendarDays,
  Monitor,
} from "lucide-react";
import { mockProducts, mockServices, mockAddresses, calculateAdminFee, ADMIN_FEE_PERCENTAGE } from "@/lib/mock-data";
import type { Address } from "@/lib/mock-data";

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  productId?: string;
}

export default function CheckoutPage({ onNavigate, productId }: CheckoutPageProps) {
  // Get product/service first to determine defaults
  // First try to find in mockProducts, then in mockServices
  let product = mockProducts.find((p) => p.id === productId);
  if (!product) {
    const service = mockServices.find((s) => s.id === productId);
    if (service) {
      // Convert Service to Product-like object for checkout
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
      };
    }
  }
  // Fallback to first product if still not found
  if (!product) {
    product = mockProducts[0];
  }
  const isService = product.type === "jasa";
  
  // Check if service has variable pricing (needs price confirmation from seller)
  const isVariablePricing = isService && (product.priceType === "starting" || product.priceType === "range");
  
  // Default shipping method based on product type
  const defaultShippingMethod = isService ? "pickup" : "cod";
  
  const [shippingMethod, setShippingMethod] = useState(defaultShippingMethod);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(mockAddresses[0]?.id || null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Service booking states
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceRequirements, setServiceRequirements] = useState(""); // For variable pricing services
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    label: "",
    recipient: "",
    phone: "",
    address: "",
    notes: "",
    saveToProfile: true,
  });
  
  // Local addresses state (for demo)
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  const quantity = 1;
  
  // Get base price based on price type for services
  const getDisplayPrice = () => {
    if (isService) {
      switch (product.priceType) {
        case "starting":
          return `Mulai ${formatPrice(product.price)}`;
        case "range":
          return `${formatPrice(product.priceMin || product.price)} - ${formatPrice(product.priceMax || product.price)}`;
        case "fixed":
        default:
          return formatPrice(product.price);
      }
    }
    return formatPrice(product.price);
  };

  // Validation checks for required fields before allowing to proceed to payment
  const isBookingDateMissing = isService && !bookingDate;
  const isServiceRequirementsMissing = isService && isVariablePricing && !serviceRequirements.trim();
  const isDeliveryAddressMissing = !isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0;

  
  // For calculation, use the base price (or minimum for range/starting)
  const basePrice = isService ? (product.priceMin || product.price) : product.price;
  const shippingFee = shippingMethod === "delivery" ? 0 : 0; // Will be set by seller for delivery
  const totalPayment = basePrice + shippingFee; // NO ADMIN FEE for buyer!
  
  // Admin fee is deducted from SELLER's income, not added to buyer's payment
  const adminFeeDeductedFromSeller = calculateAdminFee(basePrice);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  
  // Get icon for address label
  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "kos": return Home;
      case "rumah": return Building;
      case "kantor": return Building;
      case "kampus": return MapPinned;
      default: return MapPin;
    }
  };

  // Shipping options - different for services vs products
  const shippingOptions = isService 
    ? [
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
      ]
    : [
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

  const selectedShipping = shippingOptions.find((opt) => opt.id === shippingMethod);

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      label: "",
      recipient: "",
      phone: "",
      address: "",
      notes: "",
      saveToProfile: true,
    });
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
      // Update existing address
      setAddresses(addresses.map(a => 
        a.id === editingAddress.id 
          ? { ...a, ...newAddress, phone: newAddress.phone || undefined, notes: newAddress.notes || undefined }
          : a
      ));
    } else if (newAddress.saveToProfile) {
      // Add new address to profile
      const addr: Address = {
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
      setAddresses([...addresses, addr]);
      setSelectedAddressId(addr.id);
    }
    
    setShowAddressModal(false);
    setShowSaveAddressDialog(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(a => a.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(addresses[0]?.id || null);
    }
  };

  const handleSetPrimaryAddress = (addressId: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isPrimary: a.id === addressId,
    })));
  };

  const handleCreateOrder = () => {
    if (isService && !bookingDate) {
      // optionally toast/error message
      return;
    }
    if (isService && isVariablePricing && !serviceRequirements.trim()) {
      // optionally toast/error message
      return;
    }
    if (shippingMethod === "delivery" && !selectedAddressId && newAddress.address) {
      setShowSaveAddressDialog(true);
      return;
    }

    onNavigate("payment-success")
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
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
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Booking Section - Only for services */}
            {isService && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Detail Booking Jasa
                  </CardTitle>
                  <CardDescription>Pilih tanggal mulai dan tambahkan catatan untuk booking jasa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Start Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Tanggal Mulai Pengerjaan *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="booking-date"
                          className={`w-full justify-start text-left font-normal ${
                            !bookingDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingDate 
                            ? format(bookingDate, "EEEE, d MMMM yyyy", { locale: id }) 
                            : "Pilih tanggal mulai pengerjaan"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingDate}
                          onSelect={setBookingDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Pilih kapan Anda ingin penyedia mulai mengerjakan
                    </p>
                  </div>

                  {/* Deadline / Target Date - Optional */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline-date">Deadline / Target Selesai (Opsional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="deadline-date"
                          className={`w-full justify-start text-left font-normal ${
                            !deadlineDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadlineDate 
                            ? format(deadlineDate, "EEEE, d MMMM yyyy", { locale: id }) 
                            : "Pilih tanggal deadline (opsional)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadlineDate}
                          onSelect={setDeadlineDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Kapan hasil harus selesai? Bisa dinego via chat dengan penyedia
                    </p>
                  </div>

                  {/* Timeline Calculator */}
                  {bookingDate && (product.durationMin || product.durationMax) && (
                    <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                      <p className="font-medium text-primary-800 dark:text-primary-200 mb-3">📊 Timeline Pengerjaan</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24">Mulai:</span>
                          <span className="font-medium">{format(bookingDate, "d MMMM yyyy", { locale: id })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24">Durasi:</span>
                          <span className="font-medium">
                            {product.durationMin && product.durationMax
                              ? `${product.durationMin} - ${product.durationMax} ${product.durationUnit}`
                              : product.durationMin
                              ? `${product.durationMin} ${product.durationUnit}+`
                              : `Maksimal ${product.durationMax} ${product.durationUnit}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24">Est. Selesai:</span>
                          <span className="font-medium">
                            {(() => {
                              const unitDays = product.durationUnit === "jam" ? 1 : 
                                              product.durationUnit === "hari" ? 1 :
                                              product.durationUnit === "minggu" ? 7 : 30;
                              const maxDays = (product.durationMax || product.durationMin || 1) * unitDays;
                              const estDate = new Date(bookingDate);
                              estDate.setDate(estDate.getDate() + maxDays);
                              return format(estDate, "d MMMM yyyy", { locale: id });
                            })()}
                          </span>
                        </div>
                        {deadlineDate && (
                          <div className={`flex items-center gap-2 text-sm pt-2 border-t border-primary-200 dark:border-primary-700 ${
                            deadlineDate >= bookingDate ? "text-primary-700 dark:text-primary-300" : "text-red-600"
                          }`}>
                            <span className="text-muted-foreground w-24">Deadline:</span>
                            <span className="font-medium">{format(deadlineDate, "d MMMM yyyy", { locale: id })}</span>
                            {(() => {
                              const unitDays = product.durationUnit === "jam" ? 1 : 
                                              product.durationUnit === "hari" ? 1 :
                                              product.durationUnit === "minggu" ? 7 : 30;
                              const maxDays = (product.durationMax || product.durationMin || 1) * unitDays;
                              const estDate = new Date(bookingDate);
                              estDate.setDate(estDate.getDate() + maxDays);
                              
                              if (deadlineDate >= estDate) {
                                return <span className="text-primary-600 text-xs ml-2">✓ Timeline aman</span>;
                              } else {
                                return <span className="text-red-500 text-xs ml-2">⚠️ Deadline lebih cepat dari estimasi</span>;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Duration Info */}
                  {(product.durationMin || product.durationMax) && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">Estimasi Durasi</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {product.durationMin && product.durationMax
                              ? `${product.durationMin} - ${product.durationMax} ${product.durationUnit}`
                              : product.durationMin
                              ? `${product.durationMin} ${product.durationUnit}+`
                              : `Maksimal ${product.durationMax} ${product.durationUnit}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variable Pricing Requirements - For services with "starting" or "range" price */}
                  {isVariablePricing && (
                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Label htmlFor="service-requirements" className="flex items-center gap-2 text-base font-semibold">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Detail Kebutuhan Jasa *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Jelaskan detail kebutuhan kamu, kompleksitas, dan ekspektasi hasil. Penyedia jasa akan memberikan penawaran harga berdasarkan deskripsi ini.
                      </p>
                      <Textarea
                        id="service-requirements"
                        placeholder={`Contoh:\n- Untuk foto wisuda dengan 2 orang\n- Perlu 10 foto edit + 5 foto cetak\n- Lokasi di sekitar kampus\n- Waktu pengambilan sore hari`}
                        value={serviceRequirements}
                        onChange={(e) => setServiceRequirements(e.target.value)}
                        rows={6}
                        required
                        className="resize-none"
                      />
                      {isVariablePricing && !serviceRequirements.trim() && (
                        <p className="text-xs text-amber-600">
                          Harap isi detail kebutuhan jasa untuk lanjutkan booking.
                        </p>
                      )}
                      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-200">
                              ⚠️ Harga Akan Dikonfirmasi
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              {product.priceType === "starting" 
                                ? `Harga yang tertera adalah harga minimum (${formatPrice(product.price)}). Penyedia jasa akan memberikan penawaran harga final berdasarkan kompleksitas kebutuhan kamu.`
                                : `Harga final akan ditentukan dalam rentang ${formatPrice(product.priceMin || product.price)} - ${formatPrice(product.priceMax || product.price)} berdasarkan kompleksitas pekerjaan.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="service-notes">Catatan Khusus (Opsional)</Label>
                    <Textarea
                      id="service-notes"
                      placeholder="Tambahkan catatan atau permintaan khusus untuk penyedia jasa..."
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Contoh: "Saya bisa setelah jam 3 sore" atau "Lokasi dekat gerbang utama kampus"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address - Only show for delivery (non-service) */}
            {!isService && shippingMethod === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat Pengiriman
                  </CardTitle>
                  <CardDescription>Pilih alamat atau tambah alamat baru</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="space-y-3">
                      <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
                        {addresses.map((address) => {
                          const AddressIcon = getAddressIcon(address.label);
                          return (
                            <label
                              key={address.id}
                              htmlFor={address.id}
                              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedAddressId === address.id
                                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                                  : "hover:border-slate-300"
                              }`}
                            >
                              <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <AddressIcon className="h-4 w-4 text-primary-600" />
                                  <span className="font-medium">{address.label}</span>
                                  {address.isPrimary && (
                                    <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">
                                      Utama
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium mt-1">{address.recipient}</p>
                                {address.phone && (
                                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {address.address}
                                </p>
                                {address.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {address.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {!address.isPrimary && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSetPrimaryAddress(address.id);
                                    }}
                                    title="Jadikan Alamat Utama"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleEditAddress(address);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAddress(address.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={handleAddNewAddress}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Alamat Baru
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Shipping/Service Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {isService ? (
                    <>
                      <CalendarDays className="h-5 w-5" />
                      Metode Layanan
                    </>
                  ) : (
                    <>
                      <Truck className="h-5 w-5" />
                      Metode Pengiriman
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          shippingMethod === option.id
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <option.icon className="h-5 w-5 text-primary-600" />
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                {/* Info Box based on shipping method */}
                {selectedShipping && (
                  <div className={`p-4 rounded-lg border ${selectedShipping.info.color} mt-4`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{selectedShipping.info.title}</p>
                        <p className="text-sm mt-1">{selectedShipping.info.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for delivery (products only) */}
                {!isService && shippingMethod === "delivery" && (
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Estimasi Ongkir</p>
                        <p className="text-muted-foreground mt-1">
                          Penjual akan melihat alamatmu dan menghubungi via WhatsApp untuk 
                          konfirmasi ongkir. Estimasi ongkir:{ " "}
                          <strong>Rp 5.000 - Rp 20.000</strong> (tergantung jarak).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info for online service */}
                {isService && shippingMethod === "online" && (
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border">
                    <div className="flex items-start gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Layanan Online/Remote</p>
                        <p className="text-muted-foreground mt-1">
                          Penyedia jasa akan menghubungi kamu untuk koordinasi layanan secara online. 
                          Pastikan nomor WhatsApp kamu aktif.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Seller */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Hubungi Penjual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {product.seller.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{product.seller.name}</p>
                    <p className="text-sm text-muted-foreground">{product.seller.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-4">
            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    {isService ? (
                      <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium line-clamp-2">{product.title}</p>
                      {isService && (
                        <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                          Jasa
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{quantity}x</p>
                    <p className="font-bold text-primary-600">{getDisplayPrice()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                      {product.seller.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{product.seller.name}</span>
                </div>

                <Separator />

                {/* Service Booking Info - Only for services */}
                {isService && (
                  <div className="space-y-2">
                    {bookingDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tanggal:</span>
                        <span className="font-medium">
                          {format(bookingDate, "d MMMM yyyy", { locale: id })}
                        </span>
                      </div>
                    )}
                    {product.durationMin && product.durationMax && product.durationUnit && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Durasi:</span>
                        <span className="font-medium">
                          {product.durationMin === product.durationMax 
                            ? `${product.durationMin} ${product.durationUnit}`
                            : `${product.durationMin} - ${product.durationMax} ${product.durationUnit}`}
                        </span>
                      </div>
                    )}
                    {serviceNotes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Catatan: </span>
                        <span className="italic line-clamp-2">{serviceNotes}</span>
                      </div>
                    )}
                  </div>
                )}

                {isService && (bookingDate || serviceNotes) && <Separator />}

                {/* Price Breakdown - NO ADMIN FEE for buyer! */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isService ? "Harga Jasa" : "Harga Barang"}</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  {!isService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      {shippingMethod === "delivery" ? (
                        <span className="text-amber-600">Menunggu konfirmasi</span>
                      ) : (
                        <span className="text-primary-600">Gratis</span>
                      )}
                    </div>
                  )}
                  {isService && shippingMethod === "cod" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Transport</span>
                      <span className="text-muted-foreground text-xs">(dikonfirmasi nanti)</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total Pembayaran</span>
                  {!isService && shippingMethod === "delivery" ? (
                    <div className="text-right">
                      <span className="text-muted-foreground text-sm">Belum termasuk ongkir</span>
                      <p className="text-primary-600 text-lg">{formatPrice(basePrice)}</p>
                    </div>
                  ) : (
                    <span className="text-primary-600 text-lg">{formatPrice(totalPayment)}</span>
                  )}
                </div>

                {/* Order Flow Info */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  <p className="font-medium mb-2">Alur {isService ? "Booking" : "Pesanan"}:</p>
                  <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                    <li>Buat {isService ? "booking" : "pesanan"}</li>
                    <li>Tunggu konfirmasi {isService ? "penyedia jasa" : "penjual"}</li>
                    {!isService && shippingMethod === "delivery" && <li>Penjual input ongkir</li>}
                    {shippingMethod !== "cod" && <li>Bayar {isService ? "jasa" : "pesanan"}</li>}
                    <li>{isService ? "Layanan selesai" : "Terima barang"}</li>
                  </ol>
                </div>

                <Button
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  size="lg"
                  onClick={handleCreateOrder}
                  disabled={isBookingDateMissing || isServiceRequirementsMissing || isDeliveryAddressMissing}
                >
                  {isService ? "Buat Booking" : "Buat Pesanan"}
                </Button>

                {isService && !bookingDate && (
                  <p className="text-xs text-amber-600 text-center">
                    Silakan pilih tanggal booking terlebih dahulu
                  </p>
                )}

                {!isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0 && (
                  <p className="text-xs text-amber-600 text-center">
                    Silakan tambahkan alamat pengiriman terlebih dahulu
                  </p>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Dengan membuat pesanan, kamu menyetujui{" "}
                  <a href="#" className="text-primary-600 hover:underline">
                    Syarat & Ketentuan
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Trust Badge */}
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-800 dark:text-primary-200">
                      Transaksi Aman
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Pembayaran ditahan (escrow) sampai transaksi selesai
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Perbarui informasi alamat pengiriman"
                : "Masukkan detail alamat pengiriman baru"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label Alamat *</Label>
                <Input
                  id="label"
                  placeholder="Contoh: Kos, Rumah, Kampus"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP (WhatsApp)</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Nama Penerima *</Label>
              <Input
                id="recipient"
                placeholder="Nama lengkap penerima"
                value={newAddress.recipient}
                onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                placeholder="Patokan, warna rumah, dll"
                value={newAddress.notes}
                onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
              />
            </div>
            
            {!editingAddress && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.saveToProfile}
                  onChange={(e) => setNewAddress({ ...newAddress, saveToProfile: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Simpan ke daftar alamat saya</span>
              </label>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressModal(false)}>
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleSaveAddress}
              disabled={!newAddress.label || !newAddress.recipient || !newAddress.address}
            >
              {editingAddress ? "Simpan Perubahan" : "Tambah Alamat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Address Confirmation Dialog */}
      <Dialog open={showSaveAddressDialog} onOpenChange={setShowSaveAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Simpan Alamat?
            </DialogTitle>
            <DialogDescription>
              Apakah kamu ingin menyimpan alamat ini ke daftar alamat untuk penggunaan selanjutnya?
            </DialogDescription>
          </DialogHeader>
          
          {newAddress.address && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
              <p className="font-medium">{newAddress.label || "Alamat Baru"}</p>
              <p className="text-muted-foreground">{newAddress.recipient}</p>
              <p className="text-muted-foreground line-clamp-2">{newAddress.address}</p>
            </div>
          )}
          
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowSaveAddressDialog(false);
                onNavigate("payment-success");
              }}
            >
              Tidak, Teruskan Tanpa Menyimpan
            </Button>
            <Button
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                handleSaveAddress();
                onNavigate("payment-success");
              }}
            >
              Ya, Simpan Alamat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
