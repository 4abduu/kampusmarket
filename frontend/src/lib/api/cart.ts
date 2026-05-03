import { request, clearCache } from './products';
import { API_BASE_URL } from '@/lib/config';
import type { Product } from '@/lib/mock-data';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export const cartApi = {
  /**
   * Get user's cart items.
   */
  async getCart(): Promise<CartItem[]> {
    return request<CartItem[]>(`${API_BASE_URL}/cart`, undefined, {
      cacheKey: "cart",
    });
  },

  /**
   * Add product to cart.
   */
  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const res = await request<CartItem>(`${API_BASE_URL}/cart`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    clearCache("cart");
    return res;
  },

  /**
   * Update cart item quantity.
   */
  async updateCart(id: string, quantity: number): Promise<CartItem> {
    const res = await request<CartItem>(`${API_BASE_URL}/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    clearCache("cart");
    return res;
  },

  /**
   * Remove item from cart.
   */
  async removeFromCart(id: string): Promise<{ message: string }> {
    const res = await request<{ message: string }>(`${API_BASE_URL}/cart/${id}`, {
      method: "DELETE",
    });
    clearCache("cart");
    return res;
  },

  /**
   * Clear entire cart.
   */
  async clearCart(): Promise<{ message: string }> {
    const res = await request<{ message: string }>(`${API_BASE_URL}/cart`, {
      method: "DELETE",
    });
    clearCache("cart");
    return res;
  },
};

export const getCart = () => cartApi.getCart();
export const addToCart = (productId: string, quantity?: number) => cartApi.addToCart(productId, quantity);
export const updateCart = (id: string, quantity: number) => cartApi.updateCart(id, quantity);
export const removeFromCart = (id: string) => cartApi.removeFromCart(id);
export const clearCart = () => cartApi.clearCart();
