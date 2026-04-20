import apiClient from './client';

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  negoPrice?: number;
  selectedShippingOptionId: string;
  shippingType: string;
  shippingNotes?: string;
  selectedAddressId?: string;
  serviceDate?: string;
  serviceTime?: string;
  serviceNotes?: string;
  paymentMethod: string;
  notes?: string;
}

export interface Order {
  id: string;
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
  finalPrice: number;
  shippingFee: number;
  totalPrice: number;
  netIncome: number;
  shippingMethod: string;
  shippingType: string;
  serviceDate?: string;
  serviceTime?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

/**
 * Create a new order
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await apiClient.post('/orders', payload);
  return response.data.data;
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
  return response.data;
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

  const response = await apiClient.get(`/orders/buyer?${params.toString()}`);
  return response.data;
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

  const response = await apiClient.get(`/orders/seller?${params.toString()}`);
  return response.data;
};

/**
 * Get order detail
 */
export const getOrderDetail = async (orderId: string): Promise<Order> => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data.data;
};

/**
 * Pay for order
 */
export const payOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/pay`);
  return response.data.data;
};

/**
 * Complete order
 */
export const completeOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/complete`);
  return response.data.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, reason: string): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`, {
    cancelReason: reason,
  });
  return response.data.data;
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
  return response.data.data;
};

/**
 * Confirm price offer
 */
export const confirmPrice = async (orderId: string, accepted: boolean): Promise<Order> => {
  const response = await apiClient.post(`/orders/${orderId}/confirm-price`, {
    accepted,
  });
  return response.data.data;
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
  return response.data.data;
};
