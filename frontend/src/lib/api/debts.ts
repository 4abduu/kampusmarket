import apiClient from './client';

export interface CodInvoice {
  id: number;
  uuid: string;
  user_id: number;
  order_id: number;
  amount: number;
  status: 'unpaid' | 'paid';
  due_date: string;
  paid_at: string | null;
  created_at: string;
  order?: {
    id: number;
    uuid: string;
    order_number: string;
    product_title: string;
    product?: {
      id: number;
      uuid: string;
      title: string;
    }
  }
}

export interface DebtSummary {
  total_debt: number;
  has_overdue: boolean;
  is_restricted: boolean;
  invoices: CodInvoice[];
}

export const debtsApi = {
  getSummary: async () => {
    const response = await apiClient.get<{ data: DebtSummary }>('/debts/summary');
    return response.data;
  },

  payWithWallet: async (walletPin: string) => {
    const response = await apiClient.post('/debts/pay/wallet', { wallet_pin: walletPin });
    return response.data;
  },

  payWithMidtrans: async () => {
    const response = await apiClient.post<{ data: { snap_token: string; payment_uuid: string } }>('/debts/pay/midtrans');
    return response.data;
  },

  simulateExpired: async () => {
    const response = await apiClient.post('/debts/simulate-expired');
    return response.data;
  }
};
