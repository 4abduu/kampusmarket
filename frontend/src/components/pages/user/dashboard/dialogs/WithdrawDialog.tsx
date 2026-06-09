import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Building, Smartphone } from "lucide-react"
import { BANK_OPTIONS, EWALLET_OPTIONS } from "@/components/pages/user/dashboard/constants"

export type WithdrawForm = {
  type: "bank" | "ewallet"
  bankType: string
  customBankName: string
  accountNumber: string
  accountName: string
  ewalletType: string
  customEwalletName: string
  amount: string
}

interface Props {
  showWithdrawDialog: boolean
  setShowWithdrawDialog: (open: boolean) => void
  withdrawForm: WithdrawForm
  setWithdrawForm: (form: WithdrawForm) => void
  currentWalletBalance: number
  isBankLainnya: boolean
  isEwalletLainnya: boolean
  statsWalletBalance: number
  handleWithdraw: () => void
  formatPrice: (price: number) => string
  hasOverdueDebt: boolean
}

export function WithdrawDialog({
  showWithdrawDialog,
  setShowWithdrawDialog,
  withdrawForm,
  setWithdrawForm,
  currentWalletBalance,
  isBankLainnya,
  isEwalletLainnya,
  statsWalletBalance,
  handleWithdraw,
  formatPrice,
  hasOverdueDebt
}: Props) {
  return (
    <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tarik Dana</DialogTitle>
          <DialogDescription>Saldo: {formatPrice(currentWalletBalance)}</DialogDescription>
        </DialogHeader>
        {hasOverdueDebt && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div className="text-xs text-red-700 dark:text-red-300">
              <p className="font-medium">Penarikan Dana Dinonaktifkan</p>
              <p className="mt-1">Anda memiliki tunggakan komisi yang belum dilunasi. Silakan lunasi tunggakan terlebih dahulu melalui tab Tunggakan.</p>
            </div>
          </div>
        )}
        <Tabs value={withdrawForm.type} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, type: v as "bank" | "ewallet", bankType: "", ewalletType: "" })} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="bank"><Building className="h-4 w-4 mr-2" />Bank</TabsTrigger>
            <TabsTrigger value="ewallet"><Smartphone className="h-4 w-4 mr-2" />E-Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="bank" className="space-y-4">
            <div>
              <Label>Pilih Bank</Label>
              <Select value={withdrawForm.bankType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, bankType: v, customBankName: "" })}>
                <SelectTrigger><SelectValue placeholder="Pilih bank tujuan" /></SelectTrigger>
                <SelectContent>{BANK_OPTIONS.map(bank => <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isBankLainnya && (
              <div className="animate-in slide-in-from-top-2">
                <Label>Nama Bank</Label>
                <Input placeholder="Masukkan nama bank (contoh: Bank Sumut, Bank Nagari, dll)" maxLength={50} value={withdrawForm.customBankName} onChange={(e) => setWithdrawForm({ ...withdrawForm, customBankName: e.target.value.replace(/[^a-zA-Z0-9\s]/g, "") })} />
                <p className="text-xs text-muted-foreground mt-1">Masukkan nama bank yang tidak ada di daftar</p>
              </div>
            )}
            <div><Label>Nomor Rekening</Label><Input placeholder="Masukkan nomor rekening" maxLength={50} value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value.replace(/\D/g, "") })} /></div>
            <div><Label>Nama Pemilik Rekening</Label><Input placeholder="Nama sesuai buku rekening" maxLength={50} value={withdrawForm.accountName} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value.replace(/[^a-zA-Z\s']/g, "") })} /></div>
            <div>
              <Label>Jumlah Penarikan</Label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span><Input type="text" placeholder="10.000" className="pl-10" value={withdrawForm.amount ? formatPrice(parseInt(withdrawForm.amount)).replace(/^Rp\s/, "") : ""} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value.replace(/\D/g, "") })} /></div>
              <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Min: Rp 10.000</span><button className="text-primary-600 hover:underline" onClick={() => setWithdrawForm({ ...withdrawForm, amount: statsWalletBalance.toString() })}>Tarik semua</button></div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /><div className="text-xs text-blue-700 dark:text-blue-300"><p className="font-medium">Transfer Bank</p><p className="mt-1">• Proses 1x24 jam kerja</p><p>• Pastikan data rekening benar</p></div></div></div>
          </TabsContent>
          <TabsContent value="ewallet" className="space-y-4">
            <div>
              <Label>Pilih E-Wallet</Label>
              <Select value={withdrawForm.ewalletType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, ewalletType: v, customEwalletName: "" })}>
                <SelectTrigger><SelectValue placeholder="Pilih e-wallet" /></SelectTrigger>
                <SelectContent>{EWALLET_OPTIONS.map(ew => <SelectItem key={ew.id} value={ew.id}>{ew.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isEwalletLainnya && (
              <div className="animate-in slide-in-from-top-2">
                <Label>Nama E-Wallet</Label>
                <Input placeholder="Masukkan nama e-wallet (contoh: i.saku, Sakuku, dll)" maxLength={50} value={withdrawForm.customEwalletName} onChange={(e) => setWithdrawForm({ ...withdrawForm, customEwalletName: e.target.value.replace(/[^a-zA-Z0-9\s]/g, "") })} />
                <p className="text-xs text-muted-foreground mt-1">Masukkan nama e-wallet yang tidak ada di daftar</p>
              </div>
            )}
            <div><Label>Nomor HP</Label><Input placeholder="08xxxxxxxxxx" minLength={10} maxLength={15} value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value.replace(/\D/g, "") })} /></div>
            <div><Label>Nama Pemilik E-Wallet</Label><Input placeholder="Nama sesuai akun e-wallet" maxLength={50} value={withdrawForm.accountName} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value.replace(/[^a-zA-Z\s']/g, "") })} /></div>
            <div>
              <Label>Jumlah Penarikan</Label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span><Input type="text" placeholder="10.000" className="pl-10" value={withdrawForm.amount ? formatPrice(parseInt(withdrawForm.amount)).replace(/^Rp\s/, "") : ""} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value.replace(/\D/g, "") })} /></div>
              <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Min: Rp 10.000</span><button className="text-primary-600 hover:underline" onClick={() => setWithdrawForm({ ...withdrawForm, amount: statsWalletBalance.toString() })}>Tarik semua</button></div>
            </div>
            <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-secondary-600 mt-0.5 shrink-0" /><div className="text-xs text-secondary-700 dark:text-secondary-300"><p className="font-medium">Transfer E-Wallet</p><p className="mt-1">• Proses instan (5-30 menit)</p><p>• Pastikan nomor HP aktif</p></div></div></div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Batal</Button>
          <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleWithdraw} disabled={hasOverdueDebt || (withdrawForm.type === "bank" && (!withdrawForm.bankType || !withdrawForm.accountNumber || !withdrawForm.amount || (isBankLainnya && !withdrawForm.customBankName))) || (withdrawForm.type === "ewallet" && (!withdrawForm.ewalletType || !withdrawForm.accountNumber || !withdrawForm.amount || (isEwalletLainnya && !withdrawForm.customEwalletName)))}>{hasOverdueDebt ? "Penarikan Dibatasi" : "Ajukan Penarikan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
