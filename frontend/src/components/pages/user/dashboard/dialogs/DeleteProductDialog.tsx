import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/mock-data"

interface Props {
  showDeleteProductDialog: boolean
  setShowDeleteProductDialog: (open: boolean) => void
  userProducts: Product[]
  productToDelete: string | null
  handleDeleteProduct: () => void
}

export function DeleteProductDialog({
  showDeleteProductDialog,
  setShowDeleteProductDialog,
  userProducts,
  productToDelete,
  handleDeleteProduct
}: Props) {
  return (
    <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {userProducts.find(p => p.id === productToDelete)?.type === "jasa" ? "Jasa" : "Produk"}?</AlertDialogTitle>
          <AlertDialogDescription>Data akan dihapus permanen dan tidak dapat dikembalikan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteProduct}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
