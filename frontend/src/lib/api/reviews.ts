import apiClient from './client';

const unwrapApiData = <T>(response: any): T => {
  // If the response already contains meta, return the whole response object
  if (response && response.meta) {
    return response as unknown as T;
  }
  
  // Otherwise, if there is a data field (like in submitReview), return that
  const payload = response?.data ?? response;
  return payload as T;
};

export interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ReviewProduct {
  id: string;
  title: string;
  slug?: string;
  type?: string;
  images?: string[];
}

export interface Review {
  id: string;
  uuid?: string;
  orderId: string;
  reviewer?: ReviewUser;
  reviewee?: ReviewUser;
  reviewerId?: string;
  revieweeId?: string;
  productId: string;
  product?: ReviewProduct;
  rating: number;
  comment: string;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  images?: string[];
  createdAt: string;
}

export interface ReviewsMeta {
  current_page: number;
  last_page: number;
  total: number;
  averageRating?: number;
  totalReviews?: number;
  distribution?: Record<number, number>;
}

export const submitReview = async (payload: {
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
}): Promise<Review> => {
  const response = await apiClient.post('/reviews', payload);
  return unwrapApiData<Review>(response);
};

export const getGivenReviews = async (): Promise<{ data: Review[]; meta: any }> => {
  const response = await apiClient.get('/my/reviews/given?per_page=100');
  return unwrapApiData<{ data: Review[]; meta: any }>(response);
};

/**
 * Get reviews for a specific product (public).
 */
export const getProductReviews = async (
  productId: string,
  params?: { rating?: number; per_page?: number; page?: number }
): Promise<{ data: Review[]; meta: ReviewsMeta }> => {
  const queryParams = new URLSearchParams();
  if (params?.rating) queryParams.set('rating', String(params.rating));
  if (params?.per_page) queryParams.set('per_page', String(params.per_page));
  if (params?.page) queryParams.set('page', String(params.page));

  const qs = queryParams.toString();
  const url = `/products/${productId}/reviews${qs ? `?${qs}` : ''}`;
  const response = await apiClient.get(url);
  return unwrapApiData<{ data: Review[]; meta: ReviewsMeta }>(response);
};

/**
 * Get reviews received by a user (public).
 */
export const getUserReviews = async (
  userId: string,
  params?: { per_page?: number; page?: number }
): Promise<{ data: Review[]; meta: ReviewsMeta }> => {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.set('per_page', String(params.per_page));
  if (params?.page) queryParams.set('page', String(params.page));

  const qs = queryParams.toString();
  const url = `/users/${userId}/reviews${qs ? `?${qs}` : ''}`;
  const response = await apiClient.get(url);
  return unwrapApiData<{ data: Review[]; meta: ReviewsMeta }>(response);
};
