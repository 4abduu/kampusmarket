import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Minus, Plus, RefreshCcw, Wallet, XCircle } from "lucide-react"

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case "top_up":
      return <ArrowDownLeft className="h-5 w-5 text-primary-600" />
    case "withdrawal":
      return <ArrowUpRight className="h-5 w-5 text-red-600" />
    case "payment":
      return <Minus className="h-5 w-5 text-red-600" />
    case "refund":
      return <RefreshCcw className="h-5 w-5 text-primary-600" />
    case "income":
      return <Plus className="h-5 w-5 text-primary-600" />
    case "admin_fee":
      return <Minus className="h-5 w-5 text-amber-600" />
    default:
      return <Wallet className="h-5 w-5 text-muted-foreground" />
  }
}

export const formatTransactionDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const getTransactionStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="text-primary-600 border-primary-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="outline" className="text-red-600 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Gagal
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
