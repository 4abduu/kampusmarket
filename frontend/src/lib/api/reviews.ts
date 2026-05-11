import apiClient from './client';

const unwrapApiData = <T>(response: any): T => {
  const payload = response?.data ?? response;
  if (payload?.data && payload.meta) {
    return payload as T;
  }
  return (payload?.data ?? payload) as T;
};

export interface Review {
  id: string;
  uuid?: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  productId: string;
  rating: number;
  comment: string;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  images?: string[];
  createdAt: string;
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
