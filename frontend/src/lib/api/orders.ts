import apiClient from './client';

const unwrapApiData = <T>(response: any): T => {
  const payload = response?.data ?? response;
  // If it's a paginated response (has both data and meta), return the whole payload
  if (payload?.data && payload.meta) {
    return payload as T;
  }
  return (payload?.data ?? payload) as T;
};

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  negoPrice?: number;
  selectedShippingOptionId?: string;
  shippingType: string;
  shippingNotes?: string;
  selectedAddressId?: string | null;
  serviceDate?: string;
  serviceTime?: string;
  serviceNotes?: string;
  paymentMethod: string;
  notes?: string;
}

export interface Order {
  id: string;
  uuid?: string;
  orderNumber: string;
  product: any;
  productTitle: string;
  productType: 'barang' | 'jasa';
  buyer: any;
  seller: any;
  status: string;
  paymentStatus: string;
  quantity: number;
  basePrice: number;
  negoPrice?: number | null;
  finalPrice: number;
  shippingFee: number;
  adminFeePercent: number;
  adminFeeDeducted: number;
  totalPrice: number;
  netIncome: number;
  shippingMethod: string;
  shippingType: string;
  shippingAddress?: string;
  shippingNotes?: string;
  paymentMethod?: string;
  offeredPrice?: number | null;
  priceOfferNotes?: string | null;
  serviceDate?: string;
  serviceTime?: string;
  serviceNotes?: string;
  serviceDeadline?: string;
  trackingNumber?: string;
  cancelReason?: string;
  history?: any[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  sellerConfirmedAt?: string | null;
  autoConfirmDeadline?: string | null;
}

export interface PaymentResponse {
  snap_token?: string;
  payment_uuid?: string;
  token?: string;
}

/**
 * Create a new order
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await apiClient.post('/orders', payload);
  return unwrapApiData<Order>(response);
};

/**
 * Get user's orders (both as buyer and seller)
 */
export const getUserOrders = async (
  status?: string,
  asRole?: 'buyer' | 'seller',
  perPage: number = 10,
  page: number = 1
): Promise<{ data: Order[]; meta: any }> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (asRole) params.append('as', asRole);
  params.append('per_page', perPage.toString());
  params.append('page', page.toString());

  const response = await apiClient.get(`/orders?${params.toString()}`);
  return unwrapApiData<{ data: Order[]; meta: any }>(response);
};

/**
 * Get buyer's orders
 */
export const getBuyerOrders = async (
  status?: string,
  perPage: number = 10,
  page: number = 1
): Promise<{ data: Order[]; meta: any }> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('per_page', perPage.toString());
  params.append('page', page.toString());

  const response = await apiClient.get(`/orders/buyer/all?${params.toString()}`);
  return unwrapApiData<{ data: Order[]; meta: any }>(response);
};

/**
 * Get seller's orders
 */
export const getSellerOrders = async (
  status?: string,
  perPage: number = 10,
  page: number = 1
): Promise<{ data: Order[]; meta: any }> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('per_page', perPage.toString());
  params.append('page', page.toString());

  const response = await apiClient.get(`/orders/seller/all?${params.toString()}`);
  return unwrapApiData<{ data: Order[]; meta: any }>(response);
};

/**
 * Get order detail
 */
export const getOrderDetail = async (orderId: string): Promise<Order> => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return unwrapApiData<Order>(response);
};

/**
 * Pay for order (returns snap token for Midtrans or processes balance payment)
 */
export const payOrder = async (orderId: string): Promise<PaymentResponse & { order?: Order }> => {
  const response = await apiClient.post(`/orders/${orderId}/pay`);
  return unwrapApiData<PaymentResponse & { order?: Order }>(response);
};

/**
 * Seller confirm order (pending → processing/waiting_payment)
 */
export const confirmOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/confirm`);
  return unwrapApiData<Order>(response);
};

/**
 * Seller deliver / mark service done
 */
export const deliverOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/deliver`);
  return unwrapApiData<Order>(response);
};

/**
 * Buyer complete order (confirm receipt → escrow release)
 */
export const completeOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/complete`);
  return unwrapApiData<Order>(response);
};

/**
 * Cancel order (before payment — direct cancel)
 */
export const cancelOrder = async (orderId: string, reason: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`, {
    cancelReason: reason,
  });
  return unwrapApiData<Order>(response);
};

/**
 * Offer price (for variable pricing services)
 */
export const offerPrice = async (
  orderId: string,
  price: number,
  notes?: string
): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/offer-price`, {
    offeredPrice: price,
    priceOfferNotes: notes,
  });
  return unwrapApiData<Order>(response);
};

/**
 * Confirm price offer
 */
export const confirmPrice = async (orderId: string, accepted: boolean): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/confirm-price`, {
    accepted,
  });
  return unwrapApiData<Order>(response);
};

/**
 * Set shipping fee
 */
export const setShippingFee = async (
  orderId: string,
  fee: number,
  method?: string
): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/set-shipping-fee`, {
    shippingFee: fee,
    shippingMethod: method,
  });
  return unwrapApiData<Order>(response);
};

/**
 * Confirm payment status directly from frontend (Midtrans fallback)
 */
export const confirmPaymentClient = async (paymentUuid: string): Promise<any> => {
  const response = await apiClient.post('/payments/confirm', {
    payment_uuid: paymentUuid,
  });
  return unwrapApiData<any>(response);
};
