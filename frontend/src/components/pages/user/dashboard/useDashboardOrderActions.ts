import { useState } from "react"
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
    console.log("Payment via Midtrans:", paymentRequest)
    setShowPaymentDialog(false)
    setPaymentRequest(null)
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
