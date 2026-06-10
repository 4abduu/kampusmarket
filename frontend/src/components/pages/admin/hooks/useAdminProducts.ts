import { useState, useRef, useMemo, useEffect } from "react";
import type { Product } from "@/lib/mock-data";
import { adminProductsApi } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

const ITEMS_PER_PAGE = 10;

interface ProductsProps {
  isResourceLoaded: (key: string) => boolean;
  markResourceLoaded: (key: string) => void;
  fetchCategoriesResource: () => Promise<boolean>;
  showSuccess: (msg: string) => void;
}

export function useAdminProducts({
  isResourceLoaded,
  markResourceLoaded,
  fetchCategoriesResource,
  showSuccess,
}: ProductsProps) {
  const { mapProduct, mapProducts } = useAdminDataMapping();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productDeleteReason, setProductDeleteReason] = useState("");

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [productConditionFilter, setProductConditionFilter] = useState<"all" | "baru" | "bekas">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productPriceMin, setProductPriceMin] = useState<string>("");
  const [productPriceMax, setProductPriceMax] = useState<string>("");
  const [productSellerFilter, setProductSellerFilter] = useState<string>("");
  const [debouncedProductPriceMin, setDebouncedProductPriceMin] = useState<string>("");
  const [debouncedProductPriceMax, setDebouncedProductPriceMax] = useState<string>("");
  const [debouncedProductSellerFilter, setDebouncedProductSellerFilter] = useState<string>("");

  const [productPage, setProductPage] = useState(1);
  const [productTotalItems, setProductTotalItems] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSearch(productSearchTerm);
      setProductPage(1);
    }, 800);
    return () => {
      clearTimeout(handler);
    };
  }, [productSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductPriceMin(productPriceMin);
      setProductPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [productPriceMin]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductPriceMax(productPriceMax);
      setProductPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [productPriceMax]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSellerFilter(productSellerFilter);
      setProductPage(1);
    }, 800);
    return () => clearTimeout(handler);
  }, [productSellerFilter]);

  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const productRequestRef = useRef(0);
  const productDetailRequestRef = useRef(0);

  const loadProductsData = async () => {
    const requestId = ++productRequestRef.current;
    setProductsLoading(true);
    setProductsError(null);
    try {
      const params: Parameters<typeof adminProductsApi.getProducts>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: productPage,
      };

      if (debouncedProductSearch.trim()) params.search = debouncedProductSearch.trim();
      if (productTypeFilter !== "all") params.type = productTypeFilter;
      if (productConditionFilter !== "all") params.condition = productConditionFilter;
      if (productCategoryFilter !== "all") params.category_id = productCategoryFilter;
      if (debouncedProductSellerFilter.trim()) params.seller_name = debouncedProductSellerFilter.trim();
      if (debouncedProductPriceMin.trim()) params.price_min = Number(debouncedProductPriceMin);
      if (debouncedProductPriceMax.trim()) params.price_max = Number(debouncedProductPriceMax);

      const res = await adminProductsApi.getProducts(params);
      if (requestId !== productRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setProducts(mapProducts(res.data));
      }
      setProductTotalItems(res?.meta?.total ?? 0);
      setProductTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("products");

      if (!isResourceLoaded("categories")) {
        await fetchCategoriesResource();
      }
    } catch (err) {
      if (requestId !== productRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat data produk";
      setProductsError(msg);
      console.error("Failed to load products data:", err);
    } finally {
      if (requestId === productRequestRef.current) {
        setProductsLoading(false);
      }
    }
  };

  const handleViewProduct = async (product: Product) => {
    const requestId = ++productDetailRequestRef.current;
    setSelectedProduct(product);
    setProductDetailError(null);
    setShowProductDetail(true);
    setProductDetailLoading(true);

    try {
      const detail = await adminProductsApi.getProduct(product.id);
      if (requestId !== productDetailRequestRef.current) return;
      setSelectedProduct(mapProduct(detail));
    } catch (err) {
      if (requestId !== productDetailRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat detail produk";
      setProductDetailError(msg);
      console.error("Failed to load product detail:", err);
    } finally {
      if (requestId === productDetailRequestRef.current) {
        setProductDetailLoading(false);
      }
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteProductDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await adminProductsApi.deleteProduct(productToDelete.id, {
          delete_reason: "Dihapus oleh admin.",
        });
        setProducts(
          products.map((p) =>
            p.id === productToDelete.id
              ? {
                  ...p,
                  deletedAt: new Date().toISOString(),
                  deletedBy: "admin",
                }
              : p,
          ),
        );
        showSuccess(`Produk "${productToDelete.title}" berhasil dihapus`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal menghapus produk "${productToDelete.title}"`);
      } finally {
        setShowDeleteProductDialog(false);
        setProductToDelete(null);
      }
    }
  };

  const handleRestoreProduct = async (product: Product) => {
    try {
      await adminProductsApi.restoreProduct(product.id);
      setProducts(
        products.map((p) =>
          p.id === product.id
            ? { ...p, deletedAt: undefined, deletedBy: undefined }
            : p,
        ),
      );
      showSuccess(`Produk "${product.title}" berhasil dipulihkan`);
    } catch (err) {
      console.error(err);
      showSuccess(`Gagal memulihkan produk "${product.title}"`);
    }
  };

  const paginatedProducts = useMemo(() => products, [products]);

  return {
    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    showProductDetail,
    setShowProductDetail,
    productDetailLoading,
    setProductDetailLoading,
    productDetailError,
    setProductDetailError,
    showDeleteProductDialog,
    setShowDeleteProductDialog,
    productToDelete,
    setProductToDelete,
    productDeleteReason,
    setProductDeleteReason,
    productSearchTerm,
    setProductSearchTerm,
    debouncedProductSearch,
    productTypeFilter,
    setProductTypeFilter,
    productConditionFilter,
    setProductConditionFilter,
    productCategoryFilter,
    setProductCategoryFilter,
    productPriceMin,
    setProductPriceMin,
    productPriceMax,
    setProductPriceMax,
    productSellerFilter,
    setProductSellerFilter,
    debouncedProductPriceMin,
    debouncedProductPriceMax,
    debouncedProductSellerFilter,
    productPage,
    setProductPage,
    productTotalItems,
    productTotalPages,
    productsLoading,
    productsError,
    loadProductsData,
    handleViewProduct,
    handleDeleteProduct,
    confirmDeleteProduct,
    handleRestoreProduct,
    paginatedProducts,
  };
}
