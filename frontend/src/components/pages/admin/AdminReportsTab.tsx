import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, Ban, Search, X, XCircle } from "lucide-react";
import { formatAdminDate } from "./admin-dashboard.shared";

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
  handleDismissReport: (report: any) => void;
}

export default function AdminReportsTab({ filteredReports, paginatedReports, currentPage, reportSearchTerm, setReportSearchTerm, reportStatusFilter, setReportStatusFilter, setReportPage, getTotalPages, renderPagination, getReportStatusBadge, handleSendWarning, handleBanFromReport, handleDismissReport }: Props) {
  
  // Unified Warning Icon configuration color-coded by type
  const getReportTypeIcon = (type: string) => {
    switch(type) {
      case 'product': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'chat': return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      case 'user': default: return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getReportTypeBg = (type: string) => {
    switch(type) {
      case 'product': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'chat': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'user': default: return 'bg-red-100 dark:bg-red-900/30';
    }
  };

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
                <div key={report.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200 bg-white dark:bg-slate-900/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Visual Spacing and Layout alignment */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getReportTypeBg(report.reportType)}`}>
                        {getReportTypeIcon(report.reportType)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {report.reason}
                          </p>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            {report.reportType}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                          {report.description}
                        </p>
                        
                        {/* Context data if any */}
                        {report.reportType === 'product' && report.productTitle && (
                          <div className="text-xs p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/80 max-w-xl">
                            <span className="font-bold text-[9px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider">
                              Produk Dilaporkan:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{report.productTitle}</span>
                          </div>
                        )}
                        {report.reportType === 'chat' && report.chatMessage && (
                          <div className="text-xs p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/80 max-w-xl">
                            <span className="font-bold text-[9px] text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider">
                              Pesan Dilaporkan:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 italic">"{report.chatMessage}"</span>
                          </div>
                        )}
                        
                        {/* Spacing & Metadata Info (Pelapor, Dilaporkan, Tanggal) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">Pelapor:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{report.reporter?.name || "-"}</span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">Dilaporkan:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{report.reportedUser?.name || "-"}</span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">Tanggal:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{formatAdminDate(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status & Actions layout alignment */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/80">
                      {getReportStatusBadge(report.status)}
                      
                      {report.status === "pending" && (
                        <div className="flex gap-1 sm:mt-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50/50" onClick={() => handleSendWarning(report)}>
                            <MessageCircle className="h-3.5 w-3.5 mr-1" />Warning
                          </Button>
                          <Button variant="destructive" size="sm" className="h-8 text-xs bg-red-600 hover:bg-red-700" onClick={() => handleBanFromReport(report)}>
                            <Ban className="h-3.5 w-3.5 mr-1" />Ban
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => handleDismissReport(report)}>
                            <XCircle className="h-3.5 w-3.5 mr-1" />Abaikan
                          </Button>
                        </div>
                      )}
                    </div>
                    
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
