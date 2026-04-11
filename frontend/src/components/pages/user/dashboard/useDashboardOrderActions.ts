import { useState } from "react"
import { mockOrders } from "@/lib/mock-data"

export function useDashboardOrderActions() {
  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [shippingFee, setShippingFee] = useState("")
  const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

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

  const handleAcceptPrice = (orderId: string) => {
    console.log("Price accepted for order:", orderId)
  }

  const handleRejectPrice = (orderId: string) => {
    console.log("Price rejected for order:", orderId)
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
    showServicePriceDialog,
    setShowServicePriceDialog,
    selectedServiceOrder,
    servicePriceForm,
    setServicePriceForm,
    handleOpenServicePriceDialog,
    handleSubmitServicePrice,
    handleAcceptPrice,
    handleRejectPrice,
  }
}
