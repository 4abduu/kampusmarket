import { useMemo, useState, useEffect } from "react"
import type { Product } from "@/lib/mock-data"
import { updateProduct, deleteProduct as apiDeleteProduct, getMyProducts } from "@/lib/api/products"
import { toast } from "sonner"

type ProductFilter = "semua" | "barang" | "jasa"

interface UseDashboardProductsParams {
  initialProducts: Product[]
}

export function useDashboardProducts({ initialProducts }: UseDashboardProductsParams) {
  const [userProducts, setUserProducts] = useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [productFilter, setProductFilter] = useState<ProductFilter>("semua")
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const response = await getMyProducts()
        const products = (response as any)?.data ?? response ?? []
        setUserProducts(products as Product[])
      } catch (err) {
        console.error("Failed to fetch user products:", err)
        toast.error("Gagal memuat produk anda")
        // Fallback to initialProducts if API fails
        setUserProducts(initialProducts)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return userProducts.filter((product) => {
      if (productFilter === "semua") return true
      return product.type === productFilter
    })
  }, [productFilter, userProducts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatPriceRange = (product: Product) => {
    if (product.priceType === "range" && product.priceMin && product.priceMax) {
      return `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax)}`
    }
    if (product.priceType === "starting") {
      return `Mulai ${formatPrice(product.price)}`
    }
    return formatPrice(product.price)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product })
    setShowEditProductDialog(true)
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    // Validation
    const errors: string[] = []
    if (!editingProduct.title?.trim()) errors.push("Judul harus diisi")
    if (!editingProduct.description?.trim()) errors.push("Deskripsi harus diisi")
    if (!editingProduct.location?.trim()) errors.push("Lokasi harus diisi")
    if (editingProduct.price <= 0 && editingProduct.type === "barang") errors.push("Harga harus lebih dari 0")
    if ((editingProduct.priceMin || 0) <= 0 && editingProduct.type === "jasa") errors.push("Harga minimum harus lebih dari 0")
    if ((editingProduct.images?.length ?? 0) === 0) errors.push("Minimal 1 foto harus diupload")
    if (editingProduct.type === "barang" && editingProduct.stock < 0) errors.push("Stok tidak boleh negatif")
    
    // Validate status/stock relationship for barang
    if (editingProduct.type === "barang") {
      if (editingProduct.status === "sold_out" && editingProduct.stock > 0) {
        errors.push("Status 'Terjual' hanya bisa digunakan ketika stok = 0")
      }
      if (editingProduct.status === "active" && editingProduct.stock === 0) {
        errors.push("Status 'Aktif' hanya bisa digunakan ketika stok > 0")
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join("\n"))
      return
    }

    try {
      // If product came from backend (has id), call API to persist
      if (editingProduct.id) {
        // Build payload - backend expects snake_case keys
        const payload: any = {
          title: editingProduct.title?.trim(),
          description: editingProduct.description?.trim(),
          location: editingProduct.location?.trim(),
          category_id: editingProduct.categoryId,
          can_nego: editingProduct.canNego,
          status: editingProduct.status || "active",
        }

        // Add type-specific fields
        if (editingProduct.type === "barang") {
          payload.price = editingProduct.price
          payload.stock = editingProduct.stock
          payload.condition = editingProduct.condition
          payload.weight = editingProduct.weight || null
          payload.is_cod = editingProduct.isCod
          payload.is_pickup = editingProduct.isPickup
          payload.is_delivery = editingProduct.isDelivery
          payload.delivery_fee_min = editingProduct.deliveryFeeMin || null
          payload.delivery_fee_max = editingProduct.deliveryFeeMax || null
        } else if (editingProduct.type === "jasa") {
          payload.price_min = editingProduct.priceMin
          payload.price_max = editingProduct.priceMax
          payload.duration_min = editingProduct.durationMin || null
          payload.duration_max = editingProduct.durationMax || null
          payload.duration_unit = editingProduct.durationUnit || null
          payload.duration_is_plus = editingProduct.durationIsPlus
          payload.availability_status = editingProduct.availabilityStatus
          payload.is_online = editingProduct.isOnline
          payload.is_onsite = editingProduct.isOnsite
          payload.is_home_service = editingProduct.isHomeService
        }

        // Process images - URL strings
        if (Array.isArray(editingProduct.images)) {
          payload.images = editingProduct.images.map((img: any) =>
            typeof img === "string" ? img : img?.url ?? ""
          ).filter(Boolean)
        }

        await updateProduct(editingProduct.id, payload)
      }

      setUserProducts((previous) => previous.map((product) => (
        product.id === editingProduct.id ? editingProduct : product
      )))

      setShowEditProductDialog(false)
      setEditingProduct(null)
      toast.success(editingProduct.type === "jasa" ? "Jasa berhasil diperbarui!" : "Produk berhasil diperbarui!")
    } catch (err: any) {
      console.error('Failed to update product:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Gagal memperbarui produk. Silakan coba lagi.'
      toast.error(errorMessage)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    const deletedProduct = userProducts.find((product) => product.id === productToDelete)

    try {
      // If product has id, delete on server
      if (productToDelete) {
        await apiDeleteProduct(productToDelete)
      }

      setUserProducts((previous) => previous.filter((product) => product.id !== productToDelete))
      setShowDeleteProductDialog(false)
      setProductToDelete(null)
      toast.success(deletedProduct?.type === "jasa" ? "Jasa berhasil dihapus!" : "Produk berhasil dihapus!")
    } catch (err: any) {
      console.error('Failed to delete product:', err)
      toast.error(err?.message || 'Gagal menghapus produk. Silakan coba lagi.')
    }
  }

  return {
    userProducts,
    setUserProducts,
    editingProduct,
    setEditingProduct,
    showEditProductDialog,
    setShowEditProductDialog,
    showDeleteProductDialog,
    setShowDeleteProductDialog,
    productToDelete,
    setProductToDelete,
    productFilter,
    setProductFilter,
    filteredProducts,
    formatPrice,
    formatPriceRange,
    handleEditProduct,
    handleSaveProduct,
    handleDeleteProduct,
  }
}
