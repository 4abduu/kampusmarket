import { useState } from "react"
import apiClient from "@/lib/api/client"
// @mock-flagged — mockOrders tidak lagi digunakan, order data diterima via props/params
// import { mockOrders } from "@/lib/mock-data"
import type { OrderListItem } from "@/components/pages/user/orders-list/ordersList.types"
import { offerPrice, confirmPrice, setShippingFee } from '@/lib/api/orders'
import { useToast } from '@/hooks/use-toast'

type PaymentRequest = {
  orderId: string
  orderTitle: string
  totalPayment: number
}

interface UseDashboardOrderActionsParams {
  onOrderUpdated?: () => void  // callback untuk refresh order list setelah aksi
}

export function useDashboardOrderActions({ onOrderUpdated }: UseDashboardOrderActionsParams = {}) {
  const { toast } = useToast()
  
  const [selectedShippingOrderId, setSelectedShippingOrderId] = useState<string | null>(null)
  const [showShippingDialog, setShowShippingDialogState] = useState(false)
  const [shippingFee, setShippingFeeState] = useState("")
  
  const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)

  const [showServicePriceDialog, setShowServicePriceDialog] = useState(false)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<string | null>(null)
  const [servicePriceForm, setServicePriceForm] = useState({
    price: "",
    notes: "",
  })

  // Custom setter for shipping dialog that captures the target order ID
  const setShowShippingDialog = (value: boolean | string) => {
    if (typeof value === "string") {
      setSelectedShippingOrderId(value)
      setShowShippingDialogState(true)
    } else {
      setShowShippingDialogState(value)
      if (!value) {
        setSelectedShippingOrderId(null)
      }
    }
  }

  const handleOpenServicePriceDialog = (orderId: string, currentPrice?: number) => {
    setSelectedServiceOrder(orderId)
    setServicePriceForm({
      price: currentPrice?.toString() || "",
      notes: "",
    })
    setShowServicePriceDialog(true)
  }

  const handleSubmitServicePrice = async () => {
    if (!selectedServiceOrder || !servicePriceForm.price) return
    const price = parseInt(servicePriceForm.price, 10)
    if (isNaN(price) || price <= 0) return
    try {
      await offerPrice(selectedServiceOrder, price, servicePriceForm.notes || undefined)
      setShowServicePriceDialog(false)
      setSelectedServiceOrder(null)
      setServicePriceForm({ price: "", notes: "" })
      toast({ title: 'Penawaran harga dikirim', description: 'Menunggu konfirmasi pembeli' })
      onOrderUpdated?.()
    } catch (err: any) {
      toast({ title: 'Gagal mengirim penawaran', description: err?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleAcceptPrice = (order: OrderListItem) => {
    setPaymentRequest({
      orderId: order.id,
      orderTitle: order.productTitle,
      totalPayment: order.totalPrice,
    })
    setShowPaymentDialog(true)
  }

  const handleRejectPrice = async (orderId: string) => {
    try {
      await confirmPrice(orderId, false)
      toast({ title: 'Harga ditolak', description: 'Penjual akan mendapat notifikasi' })
      onOrderUpdated?.()
    } catch (err: any) {
      toast({ title: 'Gagal menolak harga', description: err?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleSetShippingFee = async () => {
    if (!shippingFee || !selectedShippingOrderId) return
    const fee = parseInt(shippingFee, 10)
    if (isNaN(fee) || fee < 0) return
    try {
      await setShippingFee(selectedShippingOrderId, fee)
      setShowShippingDialogState(false)
      setShippingFeeState("")
      setSelectedShippingOrderId(null)
      toast({ title: 'Ongkir berhasil diatur' })
      onOrderUpdated?.()
    } catch (err: any) {
      toast({ title: 'Gagal mengatur ongkir', description: err?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handlePayWithWallet = async () => {
    if (!paymentRequest) return
    try {
      await apiClient.post(`/orders/${paymentRequest.orderId}/pay`, { paymentMethod: 'wallet' })
      setShowPaymentDialog(false)
      setPaymentRequest(null)
      toast({ title: 'Pembayaran berhasil', description: 'Pesanan sedang diproses' })
      onOrderUpdated?.()
    } catch (err: any) {
      toast({ title: 'Pembayaran gagal', description: err?.message || 'Saldo tidak cukup', variant: 'destructive' })
    }
  }

  const handlePayWithMidtrans = () => {
    if (!paymentRequest) return

    ;(async () => {
      try {
        // Call backend to create snap token via OrderController::pay
        const res = await apiClient.post(`/orders/${paymentRequest.orderId}/pay`)
        // res expected to contain data.snap_token
        const snapToken = res.data?.snap_token || res.data?.snapToken || null

        if (!snapToken && res.data?.snap_token == undefined) {
          // older API shape may return data.data.snap_token
          const possible = res?.data?.data || res?.data
          const token = (possible as any)?.snap_token || (possible as any)?.token || (possible as any)?.snapToken
          if (token) {
            openMidtrans(token)
          } else {
            console.error('No snap token returned', res)
            setShowPaymentDialog(false)
            setPaymentRequest(null)
          }
        } else {
          openMidtrans(snapToken || res.data?.snap_token)
        }
      } catch (err) {
        console.error('Midtrans create snap failed', err)
      } finally {
        setShowPaymentDialog(false)
        setPaymentRequest(null)
      }
    })()
  }

  function openMidtrans(token: string) {
    // Load snap.js dynamically if not present
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
    const isSandbox = (import.meta.env.VITE_MIDTRANS_IS_SANDBOX || 'true') === 'true'
    const snapSrc = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'

    if (!document.querySelector(`script[src="${snapSrc}"]`)) {
      const script = document.createElement('script')
      script.src = snapSrc
      if (clientKey) script.setAttribute('data-client-key', clientKey)
      script.async = true
      document.body.appendChild(script)
      script.onload = () => {
        ;(window as any).snap?.pay(token, {
          onSuccess: function (result: any) {
            console.log('Midtrans success', result)
            onOrderUpdated?.()
          },
          onPending: function (result: any) {
            console.log('Midtrans pending', result)
          },
          onError: function (result: any) {
            console.error('Midtrans error', result)
          },
          onClose: function () {
            console.warn('Midtrans popup closed by user')
          },
        })
      }
    } else {
      ;(window as any).snap?.pay(token)
    }
  }

  return {
    showShippingDialog,
    setShowShippingDialog,
    shippingFee,
    setShippingFee: setShippingFeeState,
    showOrderConfirmDialog,
    setShowOrderConfirmDialog,
    showPaymentDialog,
    setShowPaymentDialog,
    paymentRequest,
    showServicePriceDialog,
    setShowServicePriceDialog,
    selectedServiceOrder,
    servicePriceForm,
    setServicePriceForm,
    handleOpenServicePriceDialog,
    handleSubmitServicePrice,
    handleAcceptPrice,
    handleRejectPrice,
    handlePayWithWallet,
    handlePayWithMidtrans,
    handleSetShippingFee,
  }
}
