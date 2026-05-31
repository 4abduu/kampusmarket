// Mock data untuk KampusMarket
// Updated dengan semua tabel baru dari Laravel migration

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  faculty: string | null;
  isVerified: boolean;
  isBanned?: boolean;
  banReason?: string;
  isWarned?: boolean;
  warningReason?: string;
  warningCount?: number;
  role?: "user" | "admin";
  googleId?: string;
  joinedAt: string;
  // Profile page fields
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  bio?: string;
  location?: string;
  // Wallet
  walletBalance?: number; // in Rupiah
  // Customer-only flag
  isCustomerOnly?: boolean;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // "Rumah", "Kos", "Kampus"
  recipient: string;
  phone?: string;
  address: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  type: "barang" | "jasa";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  priceMin?: number; // Untuk jasa dengan range harga
  priceMax?: number;
  priceType?: "fixed" | "range" | "starting"; // fixed, range (min-max), starting (mulai dari)
  condition?: "baru" | "bekas";
  category: string;
  categoryId?: string;
  images: string[];
  seller: User;
  sellerId?: string; // ID penjual untuk navigasi ke profil
  location: string;
  stock: number;
  weight?: number; // dalam gram
  durationMin?: number; // untuk jasa
  durationMax?: number;
  durationUnit?: "jam" | "hari" | "minggu" | "bulan";
  durationIsPlus?: boolean; // e.g., "30 hari+"
  availabilityStatus?: "available" | "busy" | "full";
  canNego: boolean;
  // Metode Pengiriman (KHUSUS BARANG)
  isCod: boolean;           // COD - Bayar saat ketemuan
  isPickup: boolean;        // Ambil sendiri di lokasi seller
  isDelivery: boolean;      // Antar ke alamat buyer
  deliveryFeeMin?: number;
  deliveryFeeMax?: number;
  shippingOptions: ShippingOption[];
  // Metode Pelayanan (KHUSUS JASA)
  isOnline?: boolean;       // Layanan online/remote (via Zoom, Google Meet, dll)
  isOnsite?: boolean;       // Customer datang ke lokasi provider
  isHomeService?: boolean;  // Provider datang ke lokasi customer
  createdAt: string;
  views: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  type: "barang" | "jasa";
  status?: "draft" | "active" | "sold_out" | "archived";
  imagesDetail?: any[];
}

export interface ShippingOption {
  type: "gratis" | "cod" | "pickup" | "delivery" | "online" | "onsite" | "home_service";
  label: string;
  price: number;
  priceMax?: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceMin: number;
  priceMax: number;
  priceType: "fixed" | "range" | "starting";
  category: string;
  categoryId?: string;
  images: string[];
  provider: User;
  location: string;
  portfolio: string[];
  durationMin?: number;
  durationMax?: number;
  durationUnit?: "jam" | "hari" | "minggu" | "bulan";
  durationIsPlus?: boolean; // e.g., "30 hari+"
  availabilityStatus?: "available" | "busy" | "full";
  // Metode Pelayanan (KHUSUS JASA)
  isOnline?: boolean;       // Layanan online/remote (via Zoom, Google Meet, dll)
  isOnsite?: boolean;       // Customer datang ke lokasi provider
  isHomeService?: boolean;  // Provider datang ke lokasi customer
  // Legacy (deprecated - gunakan isOnsite dan isHomeService)
  isPickup?: boolean;       // DEPRECATED: gunakan isOnsite
  isCod?: boolean;          // DEPRECATED: gunakan isHomeService
  rating: number;
  reviewCount: number;
  orderCount: number;
  createdAt: string;
  type: "jasa";
  canNego: boolean;
}

export interface Chat {
  id: string;
  productId: string;
  product: Product;
  seller: User;
  buyer: User;
  orderId?: string;
  lastMessage: string;
  lastMessageAt: string;
  buyerUnread: number;
  sellerUnread: number;
  isActive: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "text" | "offer" | "image" | "file" | "system";
  offerPrice?: number;
  offerStatus?: "pending" | "accepted" | "rejected";
  fileUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  product: Product;
  productTitle: string;
  productType: "barang" | "jasa";
  buyer: User;
  seller: User;
  status: OrderStatus;
  quantity: number;
  basePrice: number;
  negoPrice?: number;
  finalPrice: number;
  shippingFee: number;
  adminFeePercent: number;
  adminFeeDeducted: number;
  totalPrice: number;
  netIncome: number;
  shippingMethod: string;
  shippingType: "cod" | "pickup" | "delivery" | "online" | "onsite" | "home_service";
  shippingAddress?: string;
  shippingNotes?: string;
  selectedAddressId?: string;
  // Service fields
  serviceDate?: string;
  serviceTime?: string; // Jam booking (format: "HH:mm")
  serviceDeadline?: string; // Tenggat waktu penyelesaian jasa (opsional)
  serviceNotes?: string;
  // Variable pricing untuk jasa
  offeredPrice?: number; // Harga yang ditawarkan seller
  priceOfferNotes?: string; // Catatan dari seller tentang harga
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  history?: OrderHistory[];
}

export type OrderStatus =
  | "pending"
  | "waiting_price" // Buyer checkout jasa, tunggu seller input harga
  | "waiting_confirmation" // Seller sudah input harga, tunggu buyer setuju/tolak
  | "waiting_shipping_fee" // Buyer checkout barang, tunggu seller input ongkir
  | "waiting_payment" // Seller sudah input ongkir, tunggu buyer bayar
  | "processing"
  | "ready_pickup"
  | "in_delivery"
  | "completed"
  | "cancelled";

export interface OrderHistory {
  id: string;
  orderId: string;
  status: string;
  notes?: string;
  actorId?: string;
  actorName?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewer: User;
  reviewee: User;
  productId: string;
  product?: Product;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  sellerResponse?: string;
  sellerRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reportNumber: string;
  reporter: User;
  reportedUser: User;
  reportType?: "product" | "service" | "account" | "chat";
  productId?: string;
  productTitle?: string;
  chatMessage?: string;
  reason: string;
  description: string;
  evidence?: string[];
  status: "pending" | "resolved" | "dismissed" | "warning" | "banned";
  priority: "low" | "medium" | "high";
  adminNotes?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Withdrawal {
  id: string;
  withdrawalNumber: string;
  user: User;
  amount: number;
  totalDeduction: number;
  accountType: "bank" | "e_wallet";
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "pending" | "approved" | "processing" | "completed" | "failed" | "cancelled" | "rejected";
  rejectionReason?: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PasswordResetOtp {
  id: string;
  email: string;
  otp: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "order" | "chat" | "payment" | "system" | "withdrawal" | "review";
  title: string;
  message: string;
  link?: string;
  data?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CancelRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  order?: Order;
  requester: User;
  reason: "changed_mind" | "found_better_price" | "seller_not_responding" | "other";
  description: string;
  evidence?: string[];
  status: "pending" | "approved" | "rejected" | "cancelled";
  adminNotes?: string;
  rejectionReason?: string;
  refundAmount: number;
  refundProcessed: boolean;
  createdAt: string;
  reviewedAt?: string;
  refundedAt?: string;
}

// Cancel request reason labels
export const CANCEL_REASONS: { value: string; label: string }[] = [
  { value: "changed_mind", label: "Berubah pikiran" },
  { value: "found_better_price", label: "Menemukan harga lebih murah" },
  { value: "seller_not_responding", label: "Penjual tidak merespon" },
  { value: "other", label: "Lainnya" },
];

// ============================================
// WALLET SYSTEM
// ============================================

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "top_up" | "withdrawal" | "payment" | "refund" | "income" | "admin_fee";
  amount: number; // positive for incoming, negative for outgoing
  balanceAfter: number;
  description: string;
  referenceId?: string; // orderId, withdrawalId, etc.
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: string;
}

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  top_up: { label: "Top Up", icon: "↓", color: "text-primary-600" },
  withdrawal: { label: "Penarikan", icon: "↑", color: "text-red-600" },
  payment: { label: "Pembayaran", icon: "↑", color: "text-red-600" },
  refund: { label: "Refund", icon: "↩", color: "text-primary-600" },
  income: { label: "Pendapatan", icon: "↓", color: "text-primary-600" },
  admin_fee: { label: "Biaya Admin", icon: "−", color: "text-amber-600" },
};

// Admin fee percentage
export const ADMIN_FEE_PERCENTAGE = 0.05; // 5%

// Calculate admin fee (dipotong dari pendapatan seller)
export const calculateAdminFee = (price: number): number => {
  return Math.round(price * ADMIN_FEE_PERCENTAGE);
};

// Calculate net income for seller (harga barang - 5% admin fee)
export const calculateNetIncome = (price: number): number => {
  return price - calculateAdminFee(price);
};

// Calculate total price for buyer (harga barang + ongkir, TANPA admin fee)
export const calculateBuyerTotal = (basePrice: number, shippingFee: number = 0): number => {
  return basePrice + shippingFee;
};

// Generate order number
export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `KM-${dateStr}-${random}`;
};

// Generate withdrawal number
export const generateWithdrawalNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `WD-${dateStr}-${random}`;
};

// Generate report number
export const generateReportNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `RP-${dateStr}-${random}`;
};

// Generate cancel request number
export const generateCancelRequestNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CN-${dateStr}-${random}`;
};

// ============================================
// FACULTY DATA (akan diambil dari API)
// ============================================

export const faculties: any[] = [];
export const FACULTIES: any[] = [];

// Get faculty name by id
export const getFacultyName = (id: string | null): string => {
  if (!id) return "Belum memilih";
  const faculty = faculties.find(f => f.id === id);
  return faculty?.name || id;
};

// ============================================
// EMPTY MOCK DATA (semua data sekarang dari API/database)
// ============================================

export const mockUsers: User[] = [];
export const mockAddresses: Address[] = [];
export const mockCategories: Category[] = [];
export const mockShippingOptions: ShippingOption[] = [];
export const mockProducts: Product[] = [];
export const mockServices: Service[] = [];
export const mockChats: Chat[] = [];
export const mockMessages: Message[] = [];
export const mockOrders: Order[] = [];
export const mockReviews: Review[] = [];
export const mockWithdrawals: Withdrawal[] = [];
export const mockOtps: PasswordResetOtp[] = [];
export const mockNotifications: Notification[] = [];
export const mockCancelRequests: CancelRequest[] = [];
export const mockWalletTransactions: WalletTransaction[] = [];
export const mockReports: Report[] = [];

export const platformRevenue = {
  total: 0,
  thisMonth: 0,
  lastMonth: 0,
  pendingClearance: 0,
  transactions: [] as any[],
};

// ============================================
// CATEGORIES (akan diambil dari API)
// ============================================

export const categories: { id: string; label: string }[] = [];
export const serviceCategories: { id: string; label: string }[] = [];
