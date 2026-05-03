import { create } from 'zustand';
import { cartApi } from './api/cart';

interface CartState {
  count: number;
  setCount: (count: number) => void;
  fetchCount: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  fetchCount: async () => {
    try {
      const items = await cartApi.getCart();
      // Calculate total quantity of items in cart
      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      set({ count: total });
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  },
}));
