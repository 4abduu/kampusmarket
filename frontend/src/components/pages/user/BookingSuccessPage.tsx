"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  ChevronRight,
  User,
  Briefcase,
  Home,
  Monitor,
  Wallet,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { getOrderDetail, type Order } from "@/lib/api/orders";
import { BookingSuccessPageSkeleton } from "@/components/skeleton";
import type { NavigationData } from "@/app/navigation/types";

interface BookingSuccessPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  orderId?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);

const normalizeServiceMethod = (method: string): "pickup" | "cod" | "online" => {
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

const getServiceMethodLabel = (method: string) => {
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

function extractBookingData(order: Order) {
  const createdAt = (order as any)?.createdAt || (order as any)?.created_at;
  const orderStatus = String((order as any)?.status || "pending_confirmation");
  const serviceMethodRaw = String(
    (order as any)?.shippingType || (order as any)?.shipping_type || "online"
  );
  const serviceMethodKey = normalizeServiceMethod(serviceMethodRaw);

  return {
    id: (order as any)?.uuid || (order as any)?.id || "",
    bookingId:
      (order as any)?.orderNumber || (order as any)?.order_number || "-",
    bookingDate: createdAt
      ? new Date(createdAt).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    service: {
      title:
        (order as any)?.productTitle ||
        (order as any)?.product?.title ||
        "Layanan Jasa",
      category: (order as any)?.product?.category?.name || "Jasa",
      priceMin: Number(
        (order as any)?.product?.priceMin || (order as any)?.finalPrice || 0
      ),
      priceMax: Number(
        (order as any)?.product?.priceMax || (order as any)?.finalPrice || 0
      ),
      durationMin: Number((order as any)?.product?.durationMin || 1),
      durationMax: Number((order as any)?.product?.durationMax || 1),
      durationUnit: (order as any)?.product?.durationUnit || "jam",
      provider: {
        name: (order as any)?.seller?.name || "Penyedia Jasa",
        phone: (order as any)?.seller?.phone || "-",
        rating: Number((order as any)?.seller?.rating || 0),
        totalOrders: Number((order as any)?.seller?.soldCount || 0),
      },
    },
    schedule: {
      startDate: (order as any)?.serviceDate || "Sesuai kesepakatan",
      deadline: (order as any)?.serviceDeadline || "",
      time: (order as any)?.serviceTime || "",
    },
    serviceMethod: serviceMethodKey,
    location:
      (order as any)?.shippingAddress ||
      (order as any)?.shipping_address ||
      "Sesuai kesepakatan",
    notes: (order as any)?.serviceNotes || (order as any)?.service_notes || "",
    requirements: (order as any)?.notes || "",
    estimatedPrice: Number(
      (order as any)?.totalPrice || (order as any)?.total_price || 0
    ),
    priceStatus:
      orderStatus === "waiting_price" || orderStatus === "waiting_confirmation"
        ? "pending"
        : "confirmed",
    status: orderStatus,
  };
}

export default function BookingSuccessPage({
  onNavigate,
  orderId,
}: BookingSuccessPageProps) {
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
            console.error("[BookingSuccessPage] Failed to parse recentCheckoutOrderIds");
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
              console.error(`[BookingSuccessPage] Failed to fetch order ${id}`, err);
              return null;
            })
          )
        );

        const validOrders = results.filter(Boolean) as Order[];
        setOrders(validOrders);

        if (storedIds) {
          localStorage.removeItem("recentCheckoutOrderIds");
        }
      } catch (error) {
        console.error("[BookingSuccessPage] Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [orderId]);

  const isMultiOrder = orders.length > 1;
  const bookingDataList = useMemo(
    () => orders.map(extractBookingData),
    [orders]
  );
  const firstBooking = bookingDataList[0];

  const getNextSteps = () => {
    const baseSteps = [
      { icon: Clock, text: "Tunggu konfirmasi dari penyedia jasa" },
      { icon: MessageCircle, text: "Penyedia jasa akan menghubungi via WhatsApp/Chat" },
    ];

    if (firstBooking?.priceStatus === "pending") {
      baseSteps.push({
        icon: Wallet,
        text: "Penyedia jasa akan memberikan penawaran harga final",
      });
    }

    switch (firstBooking?.serviceMethod) {
      case "pickup":
        baseSteps.push(
          { icon: Home, text: "Datang ke lokasi penyedia jasa sesuai jadwal" },
          { icon: Wallet, text: "Bayar di tempat atau transfer" }
        );
        break;
      case "cod":
        baseSteps.push(
          { icon: MapPin, text: "Koordinasikan lokasi dan waktu dengan penyedia" },
          { icon: Wallet, text: "Bayar di tempat saat layanan selesai" }
        );
        break;
      case "online":
        baseSteps.push(
          { icon: Monitor, text: "Layanan akan dilakukan secara online/remote" },
          { icon: Wallet, text: "Bayar via transfer sebelum/sesudah layanan" }
        );
        break;
      default:
        baseSteps.push({
          icon: Calendar,
          text: "Koordinasikan detail dengan penyedia jasa",
        });
    }

    return baseSteps;
  };

  if (loading) {
    return <BookingSuccessPageSkeleton />;
  }

  const serviceMethod = getServiceMethodLabel(firstBooking?.serviceMethod || "online");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-purple-100 to-white dark:from-purple-950/30 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4">
            <CheckCircle2 className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
            {isMultiOrder
              ? `${orders.length} Layanan Berhasil Dipesan!`
              : "Layanan Berhasil Dipesan!"}
          </h1>
          <p className="text-muted-foreground">
            {isMultiOrder
              ? "Semua booking jasa kamu sedang diproses. Penyedia jasa akan segera menghubungimu."
              : "Booking jasa kamu sedang diproses. Penyedia jasa akan segera menghubungimu."}
          </p>
        </div>

        {/* ── Multi-order list ── */}
        {isMultiOrder ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Daftar Booking ({bookingDataList.length})
              </h2>

              <div className="space-y-4">
                {bookingDataList.map((bd, idx) => (
                  <div key={bd.id || idx}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-2xl">🛠️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {bd.service.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bd.service.provider.name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground/70 mt-0.5">
                          {bd.bookingId}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-bold text-purple-600">
                          {formatPrice(bd.estimatedPrice)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() =>
                            onNavigate("order-detail", bd.id)
                          }
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </div>
                    {idx < bookingDataList.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total Estimasi</span>
                <span className="text-purple-600">
                  {formatPrice(
                    bookingDataList.reduce(
                      (sum, bd) => sum + bd.estimatedPrice,
                      0
                    )
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Single-order: original layout ── */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Booking</p>
                    <p className="font-bold text-lg">
                      {firstBooking?.bookingId || "-"}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
                    Menunggu Konfirmasi
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{firstBooking?.bookingDate || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Detail Layanan
                </h2>

                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-3xl">🛠️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {firstBooking?.service.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs border-purple-500 text-purple-600"
                      >
                        {firstBooking?.service.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Durasi: {firstBooking?.service.durationMin}-
                      {firstBooking?.service.durationMax}{" "}
                      {firstBooking?.service.durationUnit}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Jadwal Pelaksanaan
                      </p>
                      <p className="font-medium">
                        {firstBooking?.schedule.startDate}
                      </p>
                      {firstBooking?.schedule.time && (
                        <p className="text-sm text-muted-foreground">
                          {firstBooking.schedule.time}
                        </p>
                      )}
                    </div>
                  </div>

                  {firstBooking?.schedule.deadline && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deadline / Target Selesai
                        </p>
                        <p className="font-medium">
                          {firstBooking.schedule.deadline}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lokasi</p>
                      <p className="font-medium">
                        {firstBooking?.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <serviceMethod.icon className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Metode Layanan
                      </p>
                      <Badge className={serviceMethod.color}>
                        {serviceMethod.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {firstBooking?.requirements && (
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Detail Kebutuhan
                        </p>
                        <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          {firstBooking.requirements}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {firstBooking?.notes && (
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Catatan Khusus
                        </p>
                        <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg italic">
                          {firstBooking.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimasi Harga</span>
                    <span>
                      {formatPrice(firstBooking?.service.priceMin || 0)} -{" "}
                      {formatPrice(firstBooking?.service.priceMax || 0)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {firstBooking?.priceStatus === "pending" ? (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          Harga Akan Dikonfirmasi
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Penyedia jasa akan memberikan penawaran harga final
                          berdasarkan kompleksitas kebutuhan kamu. Harga
                          estimasi:{" "}
                          <strong>
                            {formatPrice(firstBooking?.estimatedPrice || 0)}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Pembayaran</span>
                    <span className="text-purple-600">
                      {formatPrice(firstBooking?.estimatedPrice || 0)}
                    </span>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {firstBooking?.service.provider.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          ⭐ {firstBooking?.service.provider.rating || "-"}
                        </span>
                        <span>•</span>
                        <span>
                          {firstBooking?.service.provider.totalOrders} pesanan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Next Steps ── */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Langkah Selanjutnya
            </h2>
            <div className="space-y-3">
              {getNextSteps().map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-purple-600">
                      {index + 1}
                    </span>
                  </div>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Contact ── */}
        <Card className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-800 dark:text-purple-200">
                  Ada pertanyaan?
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Hubungi penyedia jasa untuk info lebih lanjut
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-700"
                  onClick={() => onNavigate("chat")}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-700"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tips ── */}
        <Card className="mb-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Tips untuk Booking Jasa
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>Pastikan nomor WhatsApp kamu aktif dan bisa dihubungi</li>
              <li>Siapkan detail kebutuhan yang jelas untuk hasil maksimal</li>
              <li>Tanyakan portofolio atau contoh hasil sebelumnya</li>
              <li>Diskusikan revisi dan garansi sebelum pengerjaan dimulai</li>
            </ul>
          </CardContent>
        </Card>

        {/* ── Action Buttons ── */}
        <div className="space-y-3">
          {isMultiOrder ? (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
              onClick={() => onNavigate("orders")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Lihat Semua Pesanan
            </Button>
          ) : (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
              onClick={() =>
                firstBooking?.id
                  ? onNavigate("order-detail", firstBooking.id)
                  : onNavigate("orders")
              }
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Lihat Detail Booking
            </Button>
          )}

          {!isMultiOrder && (
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => onNavigate("orders")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Lihat Semua Pesanan
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={() => onNavigate("landing")}
          >
            <Home className="h-5 w-5 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
          <button
            onClick={() => onNavigate("landing")}
            className="hover:text-purple-600"
          >
            Beranda
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("services")}
            className="hover:text-purple-600"
          >
            Layanan Jasa
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("checkout")}
            className="hover:text-purple-600"
          >
            Booking
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Sukses</span>
        </nav>
      </div>
    </div>
  );
}
