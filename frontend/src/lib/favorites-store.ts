import { create } from 'zustand';
import { getFavorites } from './api/products';

interface FavoritesState {
  count: number;
  setCount: (count: number) => void;
  fetchCount: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  fetchCount: async () => {
    try {
      const items = await getFavorites();
      set({ count: items.length });
    } catch (error) {
      console.error('Failed to fetch favorites count:', error);
    }
  },
}));
