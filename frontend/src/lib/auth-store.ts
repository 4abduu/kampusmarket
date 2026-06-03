import { create } from 'zustand';

interface AuthState {
  hasOverdueDebt: boolean;
  setHasOverdueDebt: (hasDebt: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasOverdueDebt: false,
  setHasOverdueDebt: (hasDebt) => set({ hasOverdueDebt: hasDebt }),
}));
