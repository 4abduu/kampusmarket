import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Props {
  showOrderConfirmDialog: boolean
  setShowOrderConfirmDialog: (open: boolean) => void
}

export function OrderConfirmDialog({
  showOrderConfirmDialog,
  setShowOrderConfirmDialog
}: Props) {
  return (
    <AlertDialog open={showOrderConfirmDialog} onOpenChange={setShowOrderConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Barang Dikirim?</AlertDialogTitle>
          <AlertDialogDescription>Pastikan barang sudah dikirim ke pembeli.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction className="bg-primary-600 hover:bg-primary-700" onClick={() => setShowOrderConfirmDialog(false)}>Konfirmasi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
