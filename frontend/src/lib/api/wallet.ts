import apiClient from "@/lib/api/client"

export interface WalletBalance {
  success: boolean
  data: {
    balance: number
    pendingWithdrawal: number
    hasPin: boolean
  }
}

export interface WalletTopUpSnapResponse {
  success: boolean
  snap_token: string
  payment_uuid: string
}

export interface WalletTopUpConfirmResponse {
  success: boolean
  message: string
  status: "paid" | "pending" | "failed"
  balance?: number
}

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get("/wallet/balance")
    // Axios interceptor already returns response.data, so response is the full WalletBalance { success, data }
    return response as any
  },

  createTopUpSnap: async (amount: number): Promise<WalletTopUpSnapResponse> => {
    const response = await apiClient.post("/wallet/topup/midtrans/snap", { amount })
    return response as any
  },

  confirmTopUpPayment: async (paymentUuid: string): Promise<WalletTopUpConfirmResponse> => {
    const response = await apiClient.post("/wallet/topup/midtrans/confirm", { payment_uuid: paymentUuid })
    return response as any
  },

  setWalletPin: async (pin: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post("/wallet/pin", { pin })
    return response as any
  },

  forgotPin: async (): Promise<{ success: boolean; message: string; data?: { email: string } }> => {
    const response = await apiClient.post("/wallet/forgot-pin")
    return response as any
  },

  resetPin: async (otp: string, pin: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post("/wallet/reset-pin", { otp, pin })
    return response as any
  },

  requestWithdrawal: async (data: {
    amount: number
    accountType: "bank" | "e_wallet"
    bankName: string
    accountNumber: string
    accountName: string
    wallet_pin: string
  }): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post("/wallet/withdraw", data)
    return response as any
  },
}
