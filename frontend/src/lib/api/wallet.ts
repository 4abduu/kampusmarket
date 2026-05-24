import apiClient from "@/lib/api/client"

export interface WalletBalance {
  success: boolean
  data: {
    balance: number
    pendingWithdrawal: number
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
    return await apiClient.get("/wallet/balance")
  },

  createTopUpSnap: async (amount: number): Promise<WalletTopUpSnapResponse> => {
    return await apiClient.post("/wallet/topup/midtrans/snap", { amount })
  },

  confirmTopUpPayment: async (paymentUuid: string): Promise<WalletTopUpConfirmResponse> => {
    return await apiClient.post("/wallet/topup/midtrans/confirm", { payment_uuid: paymentUuid })
  },
}
