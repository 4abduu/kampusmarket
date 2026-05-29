import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MessageCircle, Ban, Search, X } from "lucide-react";
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
                <div key={report.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200 bg-white dark:bg-slate-900/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Visual Spacing and Layout alignment */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {report.reason}
                          </p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                          {report.description}
                        </p>
                        
                        {/* Spacing & Metadata Info (Pelapor, Dilaporkan, Tanggal) */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[12px] text-slate-500 dark:text-slate-400">
                          <span>Pelapor: <span className="font-medium text-slate-700 dark:text-slate-300">{report.reporter?.name || "-"}</span></span>
                          <span className="text-slate-300 dark:text-slate-800">•</span>
                          <span>Dilaporkan: <span className="font-medium text-slate-700 dark:text-slate-300">{report.reportedUser?.name || "-"}</span></span>
                          <span className="text-slate-300 dark:text-slate-800">•</span>
                          <span>{formatAdminDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status & Actions layout alignment */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/80">
                      {getReportStatusBadge(report.status)}
                      
                      {report.status === "pending" && (
                        <div className="flex gap-1 sm:mt-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/50" onClick={() => handleSendWarning(report)}>
                            <MessageCircle className="h-3.5 w-3.5 mr-1 text-slate-800 dark:text-slate-200" />Warning
                          </Button>
                          <Button variant="destructive" size="sm" className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => handleBanFromReport(report)}>
                            <Ban className="h-3.5 w-3.5 mr-1 text-white" />
                            <span className="text-white font-medium">Ban</span>
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
