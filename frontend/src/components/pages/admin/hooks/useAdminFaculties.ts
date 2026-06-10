import { useState, useMemo } from "react";
import type { Faculty } from "../admin-dashboard.shared";
import { facultiesApi } from "@/lib/api/faculties";

const ITEMS_PER_PAGE = 10;

interface FacultiesProps {
  faculties: Faculty[];
  setFaculties: (faculties: Faculty[]) => void;
  invalidateFaculties: () => void;
  refreshFaculties: () => Promise<boolean>;
  showSuccess: (msg: string) => void;
}

export function useAdminFaculties({
  faculties,
  setFaculties,
  invalidateFaculties,
  refreshFaculties,
  showSuccess,
}: FacultiesProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [showDeleteFacultyDialog, setShowDeleteFacultyDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [facultyPage, setFacultyPage] = useState(1);

  const [facultyForm, setFacultyForm] = useState<{
    name: string;
    code: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    name: "",
    code: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const filteredFaculties = useMemo(
    () =>
      faculties
        .filter((faculty) => {
          const matchesSearch =
            facultySearchTerm === "" ||
            faculty.name
              .toLowerCase()
              .includes(facultySearchTerm.toLowerCase()) ||
            faculty.code
              .toLowerCase()
              .includes(facultySearchTerm.toLowerCase());
          const matchesStatus =
            facultyStatusFilter === "all" ||
            (facultyStatusFilter === "active" && faculty.isActive) ||
            (facultyStatusFilter === "inactive" && !faculty.isActive);
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [faculties, facultySearchTerm, facultyStatusFilter],
  );

  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedFaculties = useMemo(
    () => getPaginatedData(filteredFaculties, facultyPage),
    [filteredFaculties, facultyPage],
  );

  const handleAddFaculty = () => {
    setSelectedFaculty(null);
    setFacultyForm({
      name: "",
      code: "",
      description: "",
      sortOrder: faculties.length + 1,
      isActive: true,
    });
    setShowFacultyDialog(true);
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFacultyForm({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || "",
      sortOrder: faculty.sortOrder,
      isActive: faculty.isActive,
    });
    setShowFacultyDialog(true);
  };

  const handleSaveFaculty = async () => {
    if (!facultyForm.name.trim() || !facultyForm.code.trim()) return;
    const normalizedCode = facultyForm.code
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      if (selectedFaculty) {
        const updatedFaculty = await facultiesApi.update(selectedFaculty.code, {
          code: normalizedCode || selectedFaculty.code,
          name: facultyForm.name.trim(),
          description: facultyForm.description?.trim() || "",
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties(
          faculties.map((faculty) =>
            faculty.id === selectedFaculty.id ? updatedFaculty : faculty,
          ),
        );
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyForm.name}" berhasil diperbarui`);
      } else {
        const createdFaculty = await facultiesApi.create({
          code: normalizedCode || facultyForm.code.toLowerCase(),
          name: facultyForm.name.trim(),
          description: facultyForm.description?.trim() || "",
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties([...faculties, createdFaculty]);
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyForm.name}" berhasil ditambahkan`);
      }
    } catch {
      showSuccess("Gagal menyimpan fakultas ke database. Silakan coba lagi.");
    }

    setShowFacultyDialog(false);
    setSelectedFaculty(null);
    setFacultyPage(1);
  };

  const handleDeleteFaculty = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteFacultyDialog(true);
  };

  const confirmDeleteFaculty = async () => {
    if (facultyToDelete) {
      try {
        await facultiesApi.remove(facultyToDelete.code);
        setFaculties(
          faculties.filter((faculty) => faculty.id !== facultyToDelete.id),
        );
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyToDelete.name}" berhasil dihapus`);
      } catch {
        setFaculties(
          faculties.filter((faculty) => faculty.id !== facultyToDelete.id),
        );
        showSuccess(
          `Fakultas "${facultyToDelete.name}" berhasil dihapus (mode lokal)`,
        );
      }

      setShowDeleteFacultyDialog(false);
      setFacultyToDelete(null);
    }
  };

  const handleToggleFacultyActive = async (faculty: Faculty) => {
    const nextState = !faculty.isActive;

    try {
      const updatedFaculty = await facultiesApi.updateStatus(
        faculty.code,
        nextState,
      );
      setFaculties(
        faculties.map((item) =>
          item.id === faculty.id ? updatedFaculty : item,
        ),
      );
      invalidateFaculties();
      await refreshFaculties();
      showSuccess(
        `Fakultas "${faculty.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch {
      showSuccess("Gagal mengubah status fakultas. Silakan coba lagi.");
    }
  };

  return {
    selectedFaculty,
    setSelectedFaculty,
    showFacultyDialog,
    setShowFacultyDialog,
    showDeleteFacultyDialog,
    setShowDeleteFacultyDialog,
    facultyToDelete,
    setFacultyToDelete,
    facultySearchTerm,
    setFacultySearchTerm,
    facultyStatusFilter,
    setFacultyStatusFilter,
    facultyPage,
    setFacultyPage,
    facultyForm,
    setFacultyForm,
    filteredFaculties,
    paginatedFaculties,
    handleAddFaculty,
    handleEditFaculty,
    handleSaveFaculty,
    handleDeleteFaculty,
    confirmDeleteFaculty,
    handleToggleFacultyActive,
  };
}
