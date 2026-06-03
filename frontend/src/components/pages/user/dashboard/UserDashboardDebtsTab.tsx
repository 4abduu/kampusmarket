import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CreditCard, Wallet, AlertCircle, Info } from "lucide-react";
import { debtsApi, type DebtSummary } from "@/lib/api/debts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import VerifyPinDialog from "./VerifyPinDialog";

export default function UserDashboardDebtsTab({ 
  onNavigate,
  currentUser,
}: { 
  onNavigate?: (page: string) => void;
  currentUser?: any;
}) {
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [payWalletOpen, setPayWalletOpen] = useState(false);
  const [isPayingWallet, setIsPayingWallet] = useState(false);
  const [isPayingMidtrans, setIsPayingMidtrans] = useState(false);
  const { toast } = useToast();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await debtsApi.getSummary();
      setSummary((data as any).data || data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Gagal mengambil data tunggakan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handlePayWallet = async (pin: string) => {
    try {
      setIsPayingWallet(true);
      await debtsApi.payWithWallet(pin);
      toast({
        title: "Berhasil",
        description: "Tunggakan komisi berhasil dilunasi via Dompet",
      });
      setPayWalletOpen(false);
      fetchSummary();
    } catch (error: any) {
      toast({
        title: "Gagal Melunasi",
        description: error.message || "Pastikan saldo dompet mencukupi dan PIN benar.",
        variant: "destructive"
      });
    } finally {
      setIsPayingWallet(false);
    }
  };

  const handlePayMidtrans = async () => {
    try {
      setIsPayingMidtrans(true);
      const res = await debtsApi.payWithMidtrans();
      
      // Trigger Snap Midtrans
      if ((window as any).snap) {
        (window as any).snap.pay((res as any).snap_token, {
          onSuccess: function () {
            toast({ title: "Pembayaran Berhasil", description: "Tunggakan telah dilunasi." });
            fetchSummary();
          },
          onPending: function () {
            toast({ title: "Pembayaran Tertunda", description: "Selesaikan pembayaran sesuai instruksi." });
          },
          onError: function () {
            toast({ title: "Pembayaran Gagal", description: "Silakan coba lagi.", variant: "destructive" });
          },
          onClose: function () {
            // User closed the popup
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Gagal Menginisiasi Pembayaran",
        description: error.message || "Terjadi kesalahan sistem.",
        variant: "destructive"
      });
    } finally {
      setIsPayingMidtrans(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  const rawTotal = summary?.total_debt;
  const unpaidTotal = typeof rawTotal === 'number' && !isNaN(rawTotal) 
    ? rawTotal 
    : (Number(rawTotal) || 0);

  const unpaidInvoices = summary?.invoices?.filter(inv => inv.status === 'unpaid') || [];
  const paidInvoices = summary?.invoices?.filter(inv => inv.status === 'paid') || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Tunggakan Komisi</h2>
        <p className="text-sm text-muted-foreground">
          Kelola pembayaran komisi platform dari pesanan COD atau Cash Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ringkasan Tunggakan */}
        <Card className={summary?.has_overdue ? 'border-red-200' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              Total Tunggakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-primary">
              Rp {unpaidTotal.toLocaleString("id-ID")}
            </div>
            
            {unpaidTotal > 0 && (
              <div className="space-y-3">
                {currentUser && currentUser.walletBalance < unpaidTotal && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 text-xs">Saldo Dompet Kurang</AlertTitle>
                    <AlertDescription className="text-amber-700 text-xs mt-1">
                      Saldo Anda (Rp {(currentUser.walletBalance || 0).toLocaleString("id-ID")}) tidak cukup.{" "}
                      <button
                        type="button"
                        className="underline hover:text-amber-900 font-semibold focus:outline-none"
                        onClick={() => {
                          if (onNavigate) onNavigate("dashboard/wallet");
                        }}
                      >
                        Silakan top up di sini.
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                {currentUser && currentUser.walletBalance < unpaidTotal ? (
                  <Button 
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800" 
                    disabled={true}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Bayar via Dompet (Saldo Tidak Cukup)
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => setPayWalletOpen(true)}
                    disabled={isPayingMidtrans}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Bayar via Dompet
                  </Button>
                )}
                
                {unpaidTotal >= 10000 ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handlePayMidtrans}
                    disabled={isPayingMidtrans}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isPayingMidtrans ? "Memproses..." : "Bayar Langsung via Midtrans"}
                  </Button>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 text-xs">Informasi Pembayaran</AlertTitle>
                    <AlertDescription className="text-blue-700 text-xs mt-1">
                      Pembayaran Midtrans tidak tersedia karena total tunggakan di bawah batas minimum (Rp 10.000). Silakan lakukan <strong>Top Up Dompet</strong> jika saldo Anda kurang, lalu bayar via Dompet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            {unpaidTotal === 0 && (
              <p className="text-sm text-muted-foreground">Bagus! Anda tidak memiliki tunggakan komisi saat ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabel Tagihan Unpaid */}
      {unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Tagihan Belum Dibayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidInvoices.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                  <div>
                    <p className="font-medium text-sm">Pesanan #{inv.order?.order_number}</p>
                    <p className="text-xs text-muted-foreground">{inv.order?.product_title}</p>
                    <p className="text-xs text-red-600 font-medium mt-1">
                      Jatuh Tempo: {format(new Date(inv.due_date), "dd MMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div className="font-bold">
                    Rp {inv.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabel Riwayat */}
      {paidInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Pelunasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paidInvoices.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-3 border rounded-lg opacity-70">
                  <div>
                    <p className="font-medium text-sm">Pesanan #{inv.order?.order_number}</p>
                    <p className="text-xs text-muted-foreground">Dilunasi: {inv.paid_at ? format(new Date(inv.paid_at), "dd MMM yyyy HH:mm", { locale: id }) : '-'}</p>
                  </div>
                  <div className="font-bold text-green-600">
                    Lunas
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <VerifyPinDialog
        open={payWalletOpen}
        onOpenChange={setPayWalletOpen}
        onSuccess={handlePayWallet}
        isLoading={isPayingWallet}
        description={`Masukkan 6 digit PIN Dompet untuk melunasi tagihan sebesar Rp ${unpaidTotal.toLocaleString("id-ID")}.`}
      />
    </div>
  );
}
