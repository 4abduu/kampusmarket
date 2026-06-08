import { useState, useRef, useMemo, useEffect } from "react";
import type { User } from "@/lib/mock-data";
import { adminUsersApi } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

const ITEMS_PER_PAGE = 10;

interface UsersProps {
  isResourceLoaded: (key: string) => boolean;
  markResourceLoaded: (key: string) => void;
  fetchFacultiesResource: () => Promise<boolean>;
  showSuccess: (msg: string) => void;
}

export function useAdminUsers({
  isResourceLoaded,
  markResourceLoaded,
  fetchFacultiesResource,
  showSuccess,
}: UsersProps) {
  const { mapUser, mapUsers } = useAdminDataMapping();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [unbanReason, setUnbanReason] = useState("");

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "banned" | "warned" | "unverified"
  >("all");
  const [userFacultyFilter, setUserFacultyFilter] = useState<string>("all");

  const [userPage, setUserPage] = useState(1);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserSearch(userSearchTerm);
      setUserPage(1);
    }, 800);
    return () => {
      clearTimeout(handler);
    };
  }, [userSearchTerm]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const userRequestRef = useRef(0);
  const userDetailRequestRef = useRef(0);

  const loadUsersData = async () => {
    const requestId = ++userRequestRef.current;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params: Parameters<typeof adminUsersApi.getUsers>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: userPage,
      };

      if (debouncedUserSearch.trim()) params.search = debouncedUserSearch.trim();
      if (userFacultyFilter !== "all") params.faculty_code = userFacultyFilter;

      if (userStatusFilter === "active") {
        params.is_verified = true;
        params.is_banned = false;
        params.is_warned = false;
      } else if (userStatusFilter === "banned") {
        params.is_banned = true;
      } else if (userStatusFilter === "warned") {
        params.is_warned = true;
      } else if (userStatusFilter === "unverified") {
        params.is_verified = false;
      }

      const res = await adminUsersApi.getUsers(params);
      if (requestId !== userRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setUsers(mapUsers(res.data));
      }
      setUserTotalItems(res?.meta?.total ?? 0);
      setUserTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("users");

      if (!isResourceLoaded("faculties")) {
        await fetchFacultiesResource();
      }
    } catch (err) {
      if (requestId !== userRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat data user";
      setUsersError(msg);
      console.error("Failed to load users data:", err);
    } finally {
      if (requestId === userRequestRef.current) {
        setUsersLoading(false);
      }
    }
  };

  const handleViewUser = async (user: User) => {
    const requestId = ++userDetailRequestRef.current;
    setSelectedUser(user);
    setUserDetailError(null);
    setShowUserDetail(true);
    setUserDetailLoading(true);

    try {
      const detail = await adminUsersApi.getUser(user.id);
      if (requestId !== userDetailRequestRef.current) return;
      setSelectedUser(mapUser(detail));
    } catch (err) {
      if (requestId !== userDetailRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat detail user";
      setUserDetailError(msg);
      console.error("Failed to load user detail:", err);
    } finally {
      if (requestId === userDetailRequestRef.current) {
        setUserDetailLoading(false);
      }
    }
  };

  const handleBanUser = (user: User) => {
    setUserToAction(user);
    setShowBanDialog(true);
  };

  const confirmBanUser = async () => {
    if (userToAction) {
      const reason = banReason.trim() || "Melanggar aturan platform KampusMarket.";
      try {
        await adminUsersApi.banUser(userToAction.id, {
          ban_reason: reason,
        });
        setUsers(
          users.map((u) =>
            u.id === userToAction.id
              ? {
                  ...u,
                  isBanned: true,
                  banReason: reason,
                }
              : u,
          ),
        );
        showSuccess(`User ${userToAction.name} berhasil diblokir`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal memblokir user ${userToAction.name}`);
      } finally {
        setShowBanDialog(false);
        setBanReason("");
        setUserToAction(null);
      }
    }
  };

  const handleUnbanUser = (user: User) => {
    setUserToAction(user);
    setShowUnbanDialog(true);
  };

  const confirmUnbanUser = async () => {
    if (userToAction) {
      try {
        await adminUsersApi.unbanUser(userToAction.id);
        setUsers(
          users.map((u) =>
            u.id === userToAction.id
              ? { ...u, isBanned: false, banReason: undefined }
              : u,
          ),
        );
        showSuccess(`User ${userToAction.name} berhasil di-unblock`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal meng-unblock user ${userToAction.name}`);
      } finally {
        setShowUnbanDialog(false);
        setUserToAction(null);
      }
    }
  };

  const paginatedUsers = useMemo(() => users, [users]);

  return {
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    showUserDetail,
    setShowUserDetail,
    userDetailLoading,
    setUserDetailLoading,
    userDetailError,
    setUserDetailError,
    showBanDialog,
    setShowBanDialog,
    showUnbanDialog,
    setShowUnbanDialog,
    userToAction,
    setUserToAction,
    banReason,
    setBanReason,
    unbanReason,
    setUnbanReason,
    userSearchTerm,
    setUserSearchTerm,
    debouncedUserSearch,
    userStatusFilter,
    setUserStatusFilter,
    userFacultyFilter,
    setUserFacultyFilter,
    userPage,
    setUserPage,
    userTotalItems,
    userTotalPages,
    usersLoading,
    usersError,
    loadUsersData,
    handleViewUser,
    handleBanUser,
    confirmBanUser,
    handleUnbanUser,
    confirmUnbanUser,
    paginatedUsers,
  };
}
