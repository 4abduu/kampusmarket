import { useState, useMemo, useEffect } from "react";
import type { Category } from "@/lib/mock-data";
import { adminCategoriesApi } from "@/lib/api/admin";

interface CategoriesProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  invalidateCategories: () => void;
  showSuccess: (msg: string) => void;
}

export function useAdminCategories({
  categories,
  setCategories,
  invalidateCategories,
  showSuccess,
}: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState("");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<"all" | "barang" | "jasa">("all");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "barang" as "barang" | "jasa",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategorySearch(categorySearchTerm);
    }, 800);
    return () => {
      clearTimeout(handler);
    };
  }, [categorySearchTerm]);

  const filteredCategories = useMemo(
    () =>
      categories
        .filter((cat) => {
          const matchesSearch = cat.name
            .toLowerCase()
            .includes(debouncedCategorySearch.toLowerCase());
          const matchesType =
            categoryTypeFilter === "all" || cat.type === categoryTypeFilter;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, debouncedCategorySearch, categoryTypeFilter],
  );

  const handleAddCategory = () => {
    setSelectedCategory(null);
    const barangCategories = categories.filter((c) => c.type === "barang");
    const nextSortOrder =
      barangCategories.length > 0
        ? Math.max(...barangCategories.map((c) => c.sortOrder)) + 1
        : 1;
    setCategoryForm({
      name: "",
      type: "barang",
      description: "",
      sortOrder: nextSortOrder,
      isActive: true,
    });
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      description: category.description || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      if (selectedCategory) {
        const updatedCat = await adminCategoriesApi.updateCategory(
          selectedCategory.id,
          {
            name: categoryForm.name.trim(),
            type: categoryForm.type,
            description: categoryForm.description.trim(),
            sort_order: categoryForm.sortOrder,
            is_active: categoryForm.isActive,
          },
        );

        setCategories(
          categories.map((c) =>
            c.id === selectedCategory.id
              ? {
                  ...c,
                  name: updatedCat.name,
                  type: updatedCat.type,
                  sortOrder: updatedCat.sortOrder ?? updatedCat.sort_order ?? 0,
                  isActive: updatedCat.isActive !== undefined ? updatedCat.isActive : updatedCat.is_active,
                  slug: updatedCat.slug,
                  description: updatedCat.description,
                }
              : c,
          ),
        );
        invalidateCategories();
        showSuccess(`Kategori "${categoryForm.name}" berhasil diperbarui`);
      } else {
        const newCat = await adminCategoriesApi.createCategory({
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          description: categoryForm.description.trim(),
          sort_order: categoryForm.sortOrder,
          is_active: categoryForm.isActive,
        });

        const mappedNewCat: Category = {
          id: newCat.id?.toString() || newCat.slug,
          name: newCat.name,
          slug: newCat.slug,
          type: newCat.type,
          description: newCat.description,
          sortOrder: newCat.sortOrder ?? newCat.sort_order ?? 0,
          isActive: newCat.isActive !== undefined ? newCat.isActive : newCat.is_active,
          createdAt:
            newCat.created_at || new Date().toISOString().split("T")[0],
        };

        setCategories([...categories, mappedNewCat]);
        invalidateCategories();
        showSuccess(`Kategori "${categoryForm.name}" berhasil ditambahkan`);
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      showSuccess("Gagal menyimpan kategori ke database, silakan coba lagi.");
    }

    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await adminCategoriesApi.deleteCategory(categoryToDelete.id);
        setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
        invalidateCategories();
        showSuccess(`Kategori "${categoryToDelete.name}" berhasil dihapus`);
      } catch (err) {
        console.error("Failed to delete category:", err);
        showSuccess("Gagal menghapus kategori dari database.");
      }
      setShowDeleteCategoryDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleCategoryActive = async (category: Category) => {
    const nextState = !category.isActive;
    try {
      await adminCategoriesApi.updateCategoryStatus(category.id, nextState);
      setCategories(
        categories.map((c) =>
          c.id === category.id ? { ...c, isActive: nextState } : c,
        ),
      );
      invalidateCategories();
      showSuccess(
        `Kategori "${category.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      showSuccess("Gagal mengubah status kategori.");
    }
  };

  return {
    selectedCategory,
    setSelectedCategory,
    showCategoryDialog,
    setShowCategoryDialog,
    showDeleteCategoryDialog,
    setShowDeleteCategoryDialog,
    categoryToDelete,
    setCategoryToDelete,
    categoryForm,
    setCategoryForm,
    categorySearchTerm,
    setCategorySearchTerm,
    categoryTypeFilter,
    setCategoryTypeFilter,
    filteredCategories,
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
    handleToggleCategoryActive,
  };
}
