import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Check, X } from "lucide-react";

interface Props {
  cancelRequests: any[];
  formatPrice: (value: number) => string;
  handleApproveCancelRequest: (request: any) => void;
  handleRejectCancelRequest: (request: any) => void;
}

export default function AdminCancelRequestsTab({ cancelRequests, formatPrice, handleApproveCancelRequest, handleRejectCancelRequest }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><CardTitle>Permintaan Pembatalan</CardTitle><CardDescription>Permintaan pembatalan pesanan yang sudah dikonfirmasi</CardDescription></div>
            <div className="text-sm text-muted-foreground">{cancelRequests.length} permintaan</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cancelRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><XCircle className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada permintaan pembatalan</p></div>
        ) : (
          <div className="space-y-4">
            {cancelRequests.map((cancelReq) => (
              <div key={cancelReq.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><XCircle className="h-5 w-5 text-amber-600" /></div><div><div className="flex items-center gap-2"><p className="font-medium">{cancelReq.requestNumber}</p>{cancelReq.status === "pending" && <Badge variant="outline" className="text-amber-600 border-amber-300">Menunggu</Badge>}{cancelReq.status === "approved" && <Badge variant="outline" className="text-primary-600 border-primary-300">Disetujui</Badge>}{cancelReq.status === "rejected" && <Badge variant="outline" className="text-red-600 border-red-300">Ditolak</Badge>}</div><p className="text-sm text-muted-foreground mt-1">{cancelReq.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span>Pemohon: {cancelReq.requester.name}</span><span>•</span><span>Order: {cancelReq.orderId}</span><span>•</span><span>{cancelReq.createdAt}</span></div>{cancelReq.adminNotes && <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs"><span className="text-muted-foreground">Catatan Admin:</span> {cancelReq.adminNotes}</div>}</div></div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end"><p className="text-sm font-medium">Refund: {formatPrice(cancelReq.refundAmount)}</p>{cancelReq.status === "pending" && <div className="flex gap-1 mt-2"><Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleRejectCancelRequest(cancelReq); }}><X className="h-3 w-3 mr-1" />Tolak</Button><Button variant="default" size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={(e) => { e.stopPropagation(); handleApproveCancelRequest(cancelReq); }}><Check className="h-3 w-3 mr-1" />Setujui</Button></div>}{cancelReq.status === "approved" && cancelReq.refundProcessed && <span className="text-xs text-primary-600">Refund diproses</span>}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
