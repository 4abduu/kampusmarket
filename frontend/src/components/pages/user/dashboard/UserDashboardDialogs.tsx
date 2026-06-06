import PaymentMethodDialog from "@/components/pages/user/shared/PaymentMethodDialog"
import { EditProductDialog } from "./dialogs/EditProductDialog"
import { DeleteProductDialog } from "./dialogs/DeleteProductDialog"
import { AddressDialog, type AddressForm } from "./dialogs/AddressDialog"
import { DeleteAddressDialog } from "./dialogs/DeleteAddressDialog"
import { PasswordDialog, type PasswordForm, type PasswordValidations } from "./dialogs/PasswordDialog"
import { TopUpDialog } from "./dialogs/TopUpDialog"
import { WithdrawDialog, type WithdrawForm } from "./dialogs/WithdrawDialog"
import { ShippingDialog } from "./dialogs/ShippingDialog"
import { ServicePriceDialog, type ServicePriceForm } from "./dialogs/ServicePriceDialog"
import { OrderConfirmDialog } from "./dialogs/OrderConfirmDialog"
import type { NavigateFn } from "@/app/navigation/types"
import type { Address as AddressType, Product } from "@/lib/mock-data"
import { useAuthStore } from "@/lib/auth-store"

type Props = {
  showEditProductDialog: boolean
  setShowEditProductDialog: (open: boolean) => void
  editingProduct: Product | null
  setEditingProduct: (product: Product | null) => void
  handleSaveProduct: () => void
  categories: Array<{ id: string; label: string }>
  serviceCategories: Array<{ id: string; label: string }>

  showDeleteProductDialog: boolean
  setShowDeleteProductDialog: (open: boolean) => void
  userProducts: Product[]
  productToDelete: string | null
  handleDeleteProduct: () => void

  showAddressDialog: boolean
  setShowAddressDialog: (open: boolean) => void
  editingAddress: AddressType | null
  addressForm: AddressForm
  setAddressForm: (form: AddressForm) => void
  handleSaveAddress: () => void

  showDeleteAddressDialog: boolean
  setShowDeleteAddressDialog: (open: boolean) => void
  handleDeleteAddress: () => void

  showPasswordDialog: boolean
  setShowPasswordDialog: (open: boolean) => void
  showCurrentPassword: boolean
  setShowCurrentPassword: (v: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (v: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (v: boolean) => void
  passwordForm: PasswordForm
  setPasswordForm: (form: PasswordForm) => void
  passwordValidations: PasswordValidations
  isPasswordValid: boolean
  passwordError: string
  handleChangePassword: () => Promise<void>
  isLoadingPassword?: boolean

  isSavingAddress?: boolean

  showTopUpDialog: boolean
  setShowTopUpDialog: (open: boolean) => void
  quickAmounts: number[]
  topUpAmount: string
  setTopUpAmount: (amount: string) => void
  formatPrice: (price: number) => string
  handleTopUp: () => void
  isLoadingTopUp?: boolean

  showWithdrawDialog: boolean
  setShowWithdrawDialog: (open: boolean) => void
  withdrawForm: WithdrawForm
  setWithdrawForm: (form: WithdrawForm) => void
  currentWalletBalance: number
  isBankLainnya: boolean
  isEwalletLainnya: boolean
  statsWalletBalance: number
  handleWithdraw: () => void

  showShippingDialog: boolean
  setShowShippingDialog: (open: boolean) => void
  shippingFee: string
  setShippingFee: (fee: string) => void
  handleSetShippingFee: () => void

  showServicePriceDialog: boolean
  setShowServicePriceDialog: (open: boolean) => void
  selectedServiceOrder: any | null
  servicePriceForm: ServicePriceForm
  setServicePriceForm: (form: ServicePriceForm) => void
  handleSubmitServicePrice: () => void

  showOrderConfirmDialog: boolean
  setShowOrderConfirmDialog: (open: boolean) => void

  showPaymentDialog: boolean
  setShowPaymentDialog: (open: boolean) => void
  paymentRequest: { orderId: string; orderTitle: string; totalPayment: number } | null
  handlePayWithWallet: () => void
  handlePayWithMidtrans: () => void

  onNavigate?: NavigateFn
  currentUserEmail?: string
}

export default function UserDashboardDialogs(props: Props) {
  const hasOverdueDebt = useAuthStore((s) => s.hasOverdueDebt);

  return (
    <>
      <EditProductDialog
        showEditProductDialog={props.showEditProductDialog}
        setShowEditProductDialog={props.setShowEditProductDialog}
        editingProduct={props.editingProduct}
        setEditingProduct={props.setEditingProduct}
        handleSaveProduct={props.handleSaveProduct}
        categories={props.categories}
        serviceCategories={props.serviceCategories}
      />

      <DeleteProductDialog
        showDeleteProductDialog={props.showDeleteProductDialog}
        setShowDeleteProductDialog={props.setShowDeleteProductDialog}
        userProducts={props.userProducts}
        productToDelete={props.productToDelete}
        handleDeleteProduct={props.handleDeleteProduct}
      />

      <AddressDialog
        showAddressDialog={props.showAddressDialog}
        setShowAddressDialog={props.setShowAddressDialog}
        editingAddress={props.editingAddress}
        addressForm={props.addressForm}
        setAddressForm={props.setAddressForm}
        handleSaveAddress={props.handleSaveAddress}
        isSavingAddress={props.isSavingAddress}
      />

      <DeleteAddressDialog
        showDeleteAddressDialog={props.showDeleteAddressDialog}
        setShowDeleteAddressDialog={props.setShowDeleteAddressDialog}
        handleDeleteAddress={props.handleDeleteAddress}
      />

      <PasswordDialog
        showPasswordDialog={props.showPasswordDialog}
        setShowPasswordDialog={props.setShowPasswordDialog}
        showCurrentPassword={props.showCurrentPassword}
        setShowCurrentPassword={props.setShowCurrentPassword}
        showNewPassword={props.showNewPassword}
        setShowNewPassword={props.setShowNewPassword}
        showConfirmPassword={props.showConfirmPassword}
        setShowConfirmPassword={props.setShowConfirmPassword}
        passwordForm={props.passwordForm}
        setPasswordForm={props.setPasswordForm}
        passwordValidations={props.passwordValidations}
        isPasswordValid={props.isPasswordValid}
        passwordError={props.passwordError}
        handleChangePassword={props.handleChangePassword}
        isLoadingPassword={props.isLoadingPassword}
        onNavigate={props.onNavigate}
        currentUserEmail={props.currentUserEmail}
      />

      <TopUpDialog
        showTopUpDialog={props.showTopUpDialog}
        setShowTopUpDialog={props.setShowTopUpDialog}
        quickAmounts={props.quickAmounts}
        topUpAmount={props.topUpAmount}
        setTopUpAmount={props.setTopUpAmount}
        formatPrice={props.formatPrice}
        handleTopUp={props.handleTopUp}
        isLoadingTopUp={props.isLoadingTopUp}
      />

      <WithdrawDialog
        showWithdrawDialog={props.showWithdrawDialog}
        setShowWithdrawDialog={props.setShowWithdrawDialog}
        withdrawForm={props.withdrawForm}
        setWithdrawForm={props.setWithdrawForm}
        currentWalletBalance={props.currentWalletBalance}
        isBankLainnya={props.isBankLainnya}
        isEwalletLainnya={props.isEwalletLainnya}
        statsWalletBalance={props.statsWalletBalance}
        handleWithdraw={props.handleWithdraw}
        formatPrice={props.formatPrice}
        hasOverdueDebt={hasOverdueDebt}
      />

      <ShippingDialog
        showShippingDialog={props.showShippingDialog}
        setShowShippingDialog={props.setShowShippingDialog}
        shippingFee={props.shippingFee}
        setShippingFee={props.setShippingFee}
        handleSetShippingFee={props.handleSetShippingFee}
      />

      <ServicePriceDialog
        showServicePriceDialog={props.showServicePriceDialog}
        setShowServicePriceDialog={props.setShowServicePriceDialog}
        selectedServiceOrder={props.selectedServiceOrder}
        servicePriceForm={props.servicePriceForm}
        setServicePriceForm={props.setServicePriceForm}
        handleSubmitServicePrice={props.handleSubmitServicePrice}
        formatPrice={props.formatPrice}
      />

      <OrderConfirmDialog
        showOrderConfirmDialog={props.showOrderConfirmDialog}
        setShowOrderConfirmDialog={props.setShowOrderConfirmDialog}
      />

      <PaymentMethodDialog
        open={props.showPaymentDialog}
        onOpenChange={props.setShowPaymentDialog}
        totalPayment={props.paymentRequest?.totalPayment || 0}
        formatPrice={props.formatPrice}
        title="Pilih Metode Pembayaran"
        description={props.paymentRequest ? `Lanjutkan pembayaran untuk ${props.paymentRequest.orderTitle}.` : "Pilih metode pembayaran yang ingin digunakan."}
        summaryLabel={props.paymentRequest ? `Pembayaran ${props.paymentRequest.orderId}` : "Total pembayaran"}
        onPayWithWallet={props.handlePayWithWallet}
        onPayWithMidtrans={props.handlePayWithMidtrans}
      />
    </>
  )
}
