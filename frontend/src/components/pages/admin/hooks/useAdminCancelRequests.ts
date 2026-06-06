import { useState, useMemo } from "react";
import type { CancelRequest } from "@/lib/mock-data";
import { adminCancelRequestsApi } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

interface CancelRequestsProps {
  markResourceLoaded: (key: string) => void;
  showSuccess: (msg: string) => void;
}

export function useAdminCancelRequests({
  markResourceLoaded,
  showSuccess,
}: CancelRequestsProps) {
  const { mapCancelRequest } = useAdminDataMapping();

  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [cancelRequestsLoading, setCancelRequestsLoading] = useState(false);
  const [showCancelApproveDialog, setShowCancelApproveDialog] = useState(false);
  const [showCancelRejectDialog, setShowCancelRejectDialog] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<CancelRequest | null>(null);
  const [cancelApproveNotes, setCancelApproveNotes] = useState("");
  const [cancelRejectReasonInput, setCancelRejectReasonInput] = useState("");
  const [cancelRequestRoleFilter, setCancelRequestRoleFilter] = useState<"all" | "pembeli" | "penjual">("all");
  const [cancelRequestSearchTerm, setCancelRequestSearchTerm] = useState("");

  const loadCancelRequestsData = async () => {
    setCancelRequestsLoading(true);
    try {
      const res = await adminCancelRequestsApi.getCancelRequests({
        per_page: 100,
      });
      if (res?.data && Array.isArray(res.data)) {
        setCancelRequests(res.data.map((item) => mapCancelRequest(item)));
      }
      markResourceLoaded("cancel-requests");
    } catch (err) {
      console.error("Failed to load cancel requests:", err);
    } finally {
      setCancelRequestsLoading(false);
    }
  };

  const handleApproveCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelApproveNotes("");
    setShowCancelApproveDialog(true);
  };

  const confirmApproveCancelRequest = () => {
    if (selectedCancelRequest) {
      const run = async () => {
        try {
          const updated = await adminCancelRequestsApi.approveCancelRequest(
            selectedCancelRequest.id,
            {
              adminNotes: cancelApproveNotes || undefined,
            },
          );
          const mapped = mapCancelRequest(updated);
          setCancelRequests(
            cancelRequests.map((cr) => (cr.id === mapped.id ? mapped : cr)),
          );
          showSuccess(
            `Permintaan pembatalan ${mapped.requestNumber} disetujui.`,
          );
        } catch (err) {
          console.error(err);
          showSuccess(
            `Gagal menyetujui pembatalan ${selectedCancelRequest.requestNumber}`,
          );
        } finally {
          setShowCancelApproveDialog(false);
          setSelectedCancelRequest(null);
        }
      };
      void run();
    }
  };

  const handleRejectCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelRejectReasonInput("");
    setShowCancelRejectDialog(true);
  };

  const confirmRejectCancelRequest = () => {
    if (selectedCancelRequest && cancelRejectReasonInput.trim()) {
      const run = async () => {
        try {
          const updated = await adminCancelRequestsApi.rejectCancelRequest(
            selectedCancelRequest.id,
            {
              rejectionReason: cancelRejectReasonInput.trim(),
            },
          );
          const mapped = mapCancelRequest(updated);
          setCancelRequests(
            cancelRequests.map((cr) => (cr.id === mapped.id ? mapped : cr)),
          );
          showSuccess(
            `Permintaan pembatalan ${mapped.requestNumber} ditolak.`,
          );
        } catch (err) {
          console.error(err);
          showSuccess(
            `Gagal menolak pembatalan ${selectedCancelRequest.requestNumber}`,
          );
        } finally {
          setShowCancelRejectDialog(false);
          setSelectedCancelRequest(null);
        }
      };
      void run();
    }
  };

  const filteredCancelRequests = useMemo(() => {
    return cancelRequests.filter((cr) => {
      const matchesRole = (() => {
        if (cancelRequestRoleFilter === "all") return true;
        const isBuyer = cr.requester?.id === cr.order?.buyer?.id;
        const isSeller = cr.requester?.id === cr.order?.seller?.id;
        if (cancelRequestRoleFilter === "pembeli" && isBuyer) return true;
        if (cancelRequestRoleFilter === "penjual" && isSeller) return true;
        return false;
      })();
      const matchesSearch =
        cancelRequestSearchTerm === "" ||
        cr.requestNumber
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.description
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.reason
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.requester?.name
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.orderId
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.order?.orderNumber
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [cancelRequests, cancelRequestRoleFilter, cancelRequestSearchTerm]);

  return {
    cancelRequests,
    setCancelRequests,
    cancelRequestsLoading,
    setCancelRequestsLoading,
    showCancelApproveDialog,
    setShowCancelApproveDialog,
    showCancelRejectDialog,
    setShowCancelRejectDialog,
    selectedCancelRequest,
    setSelectedCancelRequest,
    cancelApproveNotes,
    setCancelApproveNotes,
    cancelRejectReasonInput,
    setCancelRejectReasonInput,
    cancelRequestRoleFilter,
    setCancelRequestRoleFilter,
    cancelRequestSearchTerm,
    setCancelRequestSearchTerm,
    loadCancelRequestsData,
    handleApproveCancelRequest,
    confirmApproveCancelRequest,
    handleRejectCancelRequest,
    confirmRejectCancelRequest,
    filteredCancelRequests,
  };
}
