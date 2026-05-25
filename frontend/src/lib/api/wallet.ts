import apiClient from "@/lib/api/client"

const unwrapApiData = <T>(response: any): T => {
  const payload = response?.data ?? response
  return (payload?.data ?? payload) as T
}

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
    const response = await apiClient.get("/wallet/balance")
    return response.data as WalletBalance
  },

  createTopUpSnap: async (amount: number): Promise<WalletTopUpSnapResponse> => {
    const response = await apiClient.post("/wallet/topup/midtrans/snap", { amount })
    return unwrapApiData<WalletTopUpSnapResponse>(response)
  },

  confirmTopUpPayment: async (paymentUuid: string): Promise<WalletTopUpConfirmResponse> => {
    const response = await apiClient.post("/wallet/topup/midtrans/confirm", { payment_uuid: paymentUuid })
    return unwrapApiData<WalletTopUpConfirmResponse>(response)
  },
}
