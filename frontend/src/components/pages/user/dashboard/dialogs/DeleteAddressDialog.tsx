import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Props {
  showDeleteAddressDialog: boolean
  setShowDeleteAddressDialog: (open: boolean) => void
  handleDeleteAddress: () => void
}

export function DeleteAddressDialog({
  showDeleteAddressDialog,
  setShowDeleteAddressDialog,
  handleDeleteAddress
}: Props) {
  return (
    <AlertDialog open={showDeleteAddressDialog} onOpenChange={setShowDeleteAddressDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
          <AlertDialogDescription>Alamat akan dihapus permanen.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAddress}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
