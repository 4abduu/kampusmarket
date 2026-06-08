import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatAdminDate } from "../admin-dashboard.shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  cancelRequests: any[];
  cancelRequestRoleFilter: "all" | "pembeli" | "penjual";
  setCancelRequestRoleFilter: (value: "all" | "pembeli" | "penjual") => void;
  cancelRequestSearchTerm: string;
  setCancelRequestSearchTerm: (value: string) => void;
  formatPrice: (value: number) => string;
  handleApproveCancelRequest: (request: any) => void;
  handleRejectCancelRequest: (request: any) => void;
  paginatedCancelRequests: any[];
  currentPage: number;
  setCancelRequestPage: (page: number) => void;
  getTotalPages: (total: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
}

export default function AdminCancelRequestsTab({ cancelRequests, cancelRequestRoleFilter, setCancelRequestRoleFilter, cancelRequestSearchTerm, setCancelRequestSearchTerm, formatPrice, handleApproveCancelRequest, handleRejectCancelRequest, paginatedCancelRequests, currentPage, setCancelRequestPage, getTotalPages, renderPagination }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><CardTitle>Permintaan Pembatalan</CardTitle><CardDescription>Permintaan pembatalan pesanan yang sudah dikonfirmasi</CardDescription></div>
            <div className="text-sm text-muted-foreground">{cancelRequests.length} permintaan</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nomor request, alasan, atau nama pemohon..."
                value={cancelRequestSearchTerm}
                onChange={(e) => setCancelRequestSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cancelRequestRoleFilter} onValueChange={(value: any) => setCancelRequestRoleFilter(value)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Peran Pemohon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Peran</SelectItem>
                <SelectItem value="pembeli">Pembeli</SelectItem>
                <SelectItem value="penjual">Penjual</SelectItem>
              </SelectContent>
            </Select>
            {(cancelRequestSearchTerm !== "" || cancelRequestRoleFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setCancelRequestSearchTerm(""); setCancelRequestRoleFilter("all"); }} className="text-xs text-muted-foreground">
                <X className="h-3 w-3 mr-1" />Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cancelRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><XCircle className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada permintaan pembatalan</p></div>
        ) : (
          <div className="space-y-4">
            {paginatedCancelRequests.map((cancelReq) => (
              <div key={cancelReq.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200 bg-white dark:bg-slate-900/10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  {/* High fidelity spacing and alignment */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100/30 flex items-center justify-center shrink-0">
                      <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {cancelReq.requestNumber}
                        </p>
                        {cancelReq.status === "pending" && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            Menunggu
                          </Badge>
                        )}
                        {cancelReq.status === "approved" && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                            Disetujui
                          </Badge>
                        )}
                        {cancelReq.status === "rejected" && (
                          <Badge variant="outline" className="text-[10px] bg-red-50/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                            Ditolak
                          </Badge>
                        )}
                        {cancelReq.status === "cancelled" && (
                          <Badge variant="outline" className="text-[10px] bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800">
                            Dibatalkan
                          </Badge>
                        )}
                        {cancelReq.status === "withdrawn" && (
                          <Badge variant="outline" className="text-[10px] bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800">
                            Ditarik
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {cancelReq.description}
                      </p>
                      
                      {/* Spacing & Metadata Info (Pemohon, Order UUID, Tanggal) */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Pemohon:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {cancelReq.requester?.name || "Unknown"}{" "}
                            {cancelReq.requester?.id === cancelReq.order?.buyer?.id ? "(Pembeli)" : cancelReq.requester?.id === cancelReq.order?.seller?.id ? "(Penjual)" : ""}
                          </span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Order UUID:</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 select-all">{cancelReq.orderId || "-"}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Tanggal:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatAdminDate(cancelReq.createdAt)}</span>
                        </div>
                      </div>

                      {cancelReq.adminNotes && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-lg text-xs leading-relaxed max-w-xl">
                          <span className="font-bold text-[9px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider">
                            Catatan Admin:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{cancelReq.adminNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Actions layout alignment */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/80">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-semibold">Refund Amount</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatPrice(cancelReq.refundAmount)}</p>
                    </div>

                    {cancelReq.status === "pending" && (
                      <div className="grid grid-cols-2 gap-2 sm:mt-2 w-full sm:w-auto sm:min-w-[220px]">
                        <Button variant="outline" size="sm" className="h-8 text-xs w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20" onClick={(e) => { e.stopPropagation(); handleRejectCancelRequest(cancelReq); }}>
                          <X className="h-3.5 w-3.5 mr-1.5" />Tolak
                        </Button>
                        <Button variant="default" size="sm" className="h-8 text-xs w-full bg-primary-600 hover:bg-primary-700 text-white" onClick={(e) => { e.stopPropagation(); handleApproveCancelRequest(cancelReq); }}>
                          <Check className="h-3.5 w-3.5 mr-1.5" />Setujui
                        </Button>
                      </div>
                    )}
                    
                    {cancelReq.status === "approved" && cancelReq.refundProcessed && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 sm:mt-2">
                        Refund diproses
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
            {renderPagination(currentPage, getTotalPages(cancelRequests.length), setCancelRequestPage)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
