import { Store, User } from "lucide-react"

interface Props {
  isSellerView: boolean
  setIsSellerView: (value: boolean) => void
}

export default function ChatRoleToggle({ isSellerView, setIsSellerView }: Props) {
  return (
    <div className="mb-4 flex items-center justify-end gap-2">
      <span className="text-xs text-muted-foreground">View sebagai:</span>
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border">
        <button
          onClick={() => setIsSellerView(false)}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            !isSellerView
              ? "bg-primary-600 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <User className="h-3 w-3 inline mr-1" />
          Buyer
        </button>
        <button
          onClick={() => setIsSellerView(true)}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            isSellerView
              ? "bg-primary-600 text-white"
              : "hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <Store className="h-3 w-3 inline mr-1" />
          Seller
        </button>
      </div>
    </div>
  )
}
