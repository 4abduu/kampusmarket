import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MessageCircle, Ban, Search, X } from "lucide-react";

interface Props {
  filteredReports: any[];
  paginatedReports: any[];
  currentPage: number;
  reportSearchTerm: string;
  setReportSearchTerm: (value: string) => void;
  reportStatusFilter: string;
  setReportStatusFilter: (value: any) => void;
  setReportPage: (value: number) => void;
  getTotalPages: (value: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
  getReportStatusBadge: (status: string) => React.ReactNode;
  handleSendWarning: (report: any) => void;
  handleBanFromReport: (report: any) => void;
}

export default function AdminReportsTab({ filteredReports, paginatedReports, currentPage, reportSearchTerm, setReportSearchTerm, reportStatusFilter, setReportStatusFilter, setReportPage, getTotalPages, renderPagination, getReportStatusBadge, handleSendWarning, handleBanFromReport }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><CardTitle>Report Center</CardTitle><CardDescription>Laporan dari user tentang pelanggaran</CardDescription></div>
            <div className="text-sm text-muted-foreground">{filteredReports.length} laporan</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Cari alasan, pelapor, atau user dilaporkan..." value={reportSearchTerm} onChange={(e) => { setReportSearchTerm(e.target.value); setReportPage(1); }} className="pl-9" /></div>
            <Select value={reportStatusFilter} onValueChange={(value) => { setReportStatusFilter(value); setReportPage(1); }}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="reviewed">Ditinjau</SelectItem><SelectItem value="resolved">Selesai</SelectItem></SelectContent></Select>
            {reportStatusFilter !== "all" && <Button variant="ghost" size="sm" onClick={() => { setReportSearchTerm(""); setReportStatusFilter("all"); setReportPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada laporan ditemukan dengan filter tersebut</p></div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="font-medium">{report.reason}</p><p className="text-sm text-muted-foreground mt-1">{report.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span>Pelapor: {report.reporter.name}</span><span>•</span><span>Dilaporkan: {report.reportedUser.name}</span><span>•</span><span>{report.createdAt}</span></div></div></div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">{getReportStatusBadge(report.status)}{report.status === "pending" && <div className="flex gap-1 mt-2"><Button variant="outline" size="sm" onClick={() => handleSendWarning(report)}><MessageCircle className="h-3 w-3 mr-1" />Warning</Button><Button variant="destructive" size="sm" onClick={() => handleBanFromReport(report)}><Ban className="h-3 w-3 mr-1" />Ban</Button></div>}</div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination(currentPage, getTotalPages(filteredReports.length), setReportPage)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
