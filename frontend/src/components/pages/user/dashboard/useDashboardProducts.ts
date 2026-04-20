import { useMemo, useState } from "react"
import type { Product } from "@/lib/mock-data"
import { updateProduct, deleteProduct as apiDeleteProduct } from "@/lib/api/products"

type ProductFilter = "semua" | "barang" | "jasa"

interface UseDashboardProductsParams {
  initialProducts: Product[]
}

export function useDashboardProducts({ initialProducts }: UseDashboardProductsParams) {
  const [userProducts, setUserProducts] = useState<Product[]>(() => initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showProductSuccess, setShowProductSuccess] = useState(false)
  const [productSuccessMessage, setProductSuccessMessage] = useState("")
  const [productFilter, setProductFilter] = useState<ProductFilter>("semua")

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

    try {
      // If product came from backend (has id), call API to persist
      if (editingProduct.id) {
        await updateProduct(editingProduct.id, editingProduct as any)
      }

      setUserProducts((previous) => previous.map((product) => (
        product.id === editingProduct.id ? editingProduct : product
      )))

      setShowEditProductDialog(false)
      setEditingProduct(null)
      setProductSuccessMessage(editingProduct.type === "jasa" ? "Jasa berhasil diperbarui!" : "Produk berhasil diperbarui!")
      setShowProductSuccess(true)
      setTimeout(() => setShowProductSuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to update product:', err)
      alert(err?.message || 'Gagal memperbarui produk. Silakan coba lagi.')
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
      setProductSuccessMessage(deletedProduct?.type === "jasa" ? "Jasa berhasil dihapus!" : "Produk berhasil dihapus!")
      setShowProductSuccess(true)
      setTimeout(() => setShowProductSuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to delete product:', err)
      alert(err?.message || 'Gagal menghapus produk. Silakan coba lagi.')
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
    showProductSuccess,
    productSuccessMessage,
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
