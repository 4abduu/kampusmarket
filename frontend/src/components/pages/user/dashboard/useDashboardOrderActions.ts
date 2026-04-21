import { useState } from "react"
import apiClient from "@/lib/api/client"
import { mockOrders } from "@/lib/mock-data"
import type { OrderListItem } from "@/components/pages/user/orders-list/ordersList.types"

type PaymentRequest = {
  orderId: string
  orderTitle: string
  totalPayment: number
}

export function useDashboardOrderActions() {
  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [shippingFee, setShippingFee] = useState("")
  const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)

  const [showServicePriceDialog, setShowServicePriceDialog] = useState(false)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<string | null>(null)
  const [servicePriceForm, setServicePriceForm] = useState({
    price: "",
    notes: "",
  })

  const handleOpenServicePriceDialog = (orderId: string) => {
    setSelectedServiceOrder(orderId)
    const order = mockOrders.find((item) => item.id === orderId)
    if (order) {
      setServicePriceForm({
        price: order.basePrice?.toString() || "",
        notes: "",
      })
    }
    setShowServicePriceDialog(true)
  }

  const handleSubmitServicePrice = () => {
    console.log("Service price submitted:", servicePriceForm)
    setShowServicePriceDialog(false)
    setSelectedServiceOrder(null)
    setServicePriceForm({ price: "", notes: "" })
  }

  const handleAcceptPrice = (order: OrderListItem) => {
    setPaymentRequest({
      orderId: order.id,
      orderTitle: order.productTitle,
      totalPayment: order.totalPrice,
    })
    setShowPaymentDialog(true)
  }

  const handleRejectPrice = (orderId: string) => {
    console.log("Price rejected for order:", orderId)
  }

  const handlePayWithWallet = () => {
    if (!paymentRequest) return
    console.log("Payment via wallet:", paymentRequest)
    setShowPaymentDialog(false)
    setPaymentRequest(null)
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
            // Optionally refresh order data here
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
    setShippingFee,
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
  }
}
