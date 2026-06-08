import { useState, useMemo } from "react";
import type { Report, User } from "@/lib/mock-data";
import { adminReportsApi, adminUsersApi } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

const ITEMS_PER_PAGE = 10;

interface ReportsProps {
  markResourceLoaded: (key: string) => void;
  showSuccess: (msg: string) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export function useAdminReports({
  markResourceLoaded,
  showSuccess,
  users,
  setUsers,
}: ReportsProps) {
  const { mapReports } = useAdminDataMapping();

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBanReportDialog, setShowBanReportDialog] = useState(false);
  const [banReportReason, setBanReportReason] = useState("");
  const [showResolveReportDialog, setShowResolveReportDialog] = useState(false);
  const [showDismissReportDialog, setShowDismissReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<
    "all" | "pending" | "resolved" | "warning" | "banned"
  >("all");
  const [reportPage, setReportPage] = useState(1);

  const loadReportsData = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await adminReportsApi.getReports({ per_page: 100 });
      if (res?.data && Array.isArray(res.data)) {
        setReports(mapReports(res.data));
      }
      markResourceLoaded("reports");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat laporan";
      setReportsError(msg);
      console.error("Failed to load reports data:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleSendWarning = (report: Report) => {
    setSelectedReport(report);
    setShowWarningDialog(true);
  };

  const confirmSendWarning = () => {
    if (selectedReport) {
      const run = async () => {
        try {
          await adminReportsApi.reviewReport(selectedReport.id);
          if (selectedReport.reportedUser?.id) {
            await adminUsersApi.warnUser(selectedReport.reportedUser.id, selectedReport.reason);
          }
          setReports(
            reports.map((r) =>
              r.id === selectedReport.id
                ? { ...r, status: "warning" as const }
                : r,
            ),
          );
          setUsers(
            users.map((u) =>
              u.id === selectedReport.reportedUser?.id
                ? { ...u, isWarned: true, warningReason: selectedReport.reason, warningCount: (u.warningCount || 0) + 1 }
                : u,
            ),
          );
          showSuccess(
            `Warning berhasil dikirim ke ${selectedReport.reportedUser?.name}`,
          );
        } catch (err) {
          console.error(err);
          showSuccess("Gagal mengirim warning, coba lagi");
        } finally {
          setShowWarningDialog(false);
          setSelectedReport(null);
        }
      };
      void run();
    }
  };

  const handleBanFromReport = (report: Report) => {
    setSelectedReport(report);
    setBanReportReason(report.reason || report.description || "");
    setShowBanReportDialog(true);
  };

  const confirmBanFromReport = () => {
    if (selectedReport) {
      const reason = banReportReason.trim() || selectedReport.reason;
      const run = async () => {
        try {
          await adminReportsApi.resolveReport(selectedReport.id, {
            resolution: `Ban user karena laporan: ${reason}`,
            banUser: true,
            banReason: reason,
          });
          setUsers(
            users.map((u) =>
              u.id === selectedReport.reportedUser?.id
                ? { ...u, isBanned: true, banReason: reason }
                : u,
            ),
          );
          setReports(
            reports.map((r) =>
              r.reportedUser?.id === selectedReport.reportedUser?.id && (r.status === "pending" || r.status === "warning")
                ? { ...r, status: "banned" as const }
                : r,
            ),
          );
          showSuccess(`User ${selectedReport.reportedUser?.name} berhasil diblokir`);
        } catch (err) {
          console.error(err);
          showSuccess("Gagal memblokir user, coba lagi");
        } finally {
          setShowBanReportDialog(false);
          setBanReportReason("");
          setSelectedReport(null);
        }
      };
      void run();
    }
  };

  const handleResolveReport = (report: Report) => {
    setSelectedReport(report);
    setShowResolveReportDialog(true);
  };

  const confirmResolveReport = async () => {
    if (!selectedReport) return;
    try {
      await adminReportsApi.resolveReport(selectedReport.id, {
        resolution: `Diselesaikan oleh admin: ${selectedReport.reason}`,
        banUser: false,
      });
      setReports(
        reports.map((r) =>
          r.id === selectedReport.id
            ? { ...r, status: "resolved" as const }
            : r,
        ),
      );
      showSuccess(`Laporan untuk "${selectedReport.reportedUser?.name || 'User'}" berhasil diselesaikan`);
    } catch (err) {
      console.error(err);
      showSuccess("Gagal menyelesaikan laporan, coba lagi");
    } finally {
      setShowResolveReportDialog(false);
      setSelectedReport(null);
    }
  };

  const handleDismissReport = (report: Report) => {
    setSelectedReport(report);
    setShowDismissReportDialog(true);
  };

  const confirmDismissReport = async () => {
    if (!selectedReport) return;
    try {
      await adminReportsApi.dismissReport(selectedReport.id);
      setReports(
        reports.map((r) =>
          r.id === selectedReport.id
            ? { ...r, status: "dismissed" as const }
            : r,
        ),
      );
      showSuccess(`Laporan untuk "${selectedReport.reportedUser?.name || 'User'}" berhasil ditolak`);
    } catch (err) {
      console.error(err);
      showSuccess("Gagal menolak laporan, coba lagi");
    } finally {
      setShowDismissReportDialog(false);
      setSelectedReport(null);
    }
  };

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesSearch =
          reportSearchTerm === "" ||
          report.reason
            .toLowerCase()
            .includes(reportSearchTerm.toLowerCase()) ||
          report.description
            .toLowerCase()
            .includes(reportSearchTerm.toLowerCase()) ||
          report.reporter?.name
            ?.toLowerCase()
            ?.includes(reportSearchTerm.toLowerCase()) ||
          report.reportedUser?.name
            ?.toLowerCase()
            ?.includes(reportSearchTerm.toLowerCase());
        const matchesStatus =
          reportStatusFilter === "all" || report.status === reportStatusFilter;
        return matchesSearch && matchesStatus;
      }),
    [reports, reportSearchTerm, reportStatusFilter],
  );

  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedReports = useMemo(
    () => getPaginatedData(filteredReports, reportPage),
    [filteredReports, reportPage],
  );

  return {
    reports,
    setReports,
    reportsLoading,
    setReportsLoading,
    reportsError,
    setReportsError,
    showWarningDialog,
    setShowWarningDialog,
    showBanReportDialog,
    setShowBanReportDialog,
    banReportReason,
    setBanReportReason,
    showResolveReportDialog,
    setShowResolveReportDialog,
    showDismissReportDialog,
    setShowDismissReportDialog,
    selectedReport,
    setSelectedReport,
    reportSearchTerm,
    setReportSearchTerm,
    reportStatusFilter,
    setReportStatusFilter,
    reportPage,
    setReportPage,
    loadReportsData,
    handleSendWarning,
    confirmSendWarning,
    handleBanFromReport,
    confirmBanFromReport,
    handleResolveReport,
    confirmResolveReport,
    handleDismissReport,
    confirmDismissReport,
    filteredReports,
    paginatedReports,
  };
}
