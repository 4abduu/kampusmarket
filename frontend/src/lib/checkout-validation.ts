/**
 * Checkout Validation Utilities
 * - Multiple checkout rules: max 3, same method required, no cross-type
 */

export interface CheckoutItem {
  product: {
    id?: string
    uuid?: string
    type: "barang" | "jasa"
    title: string
    shippingMethods?: string[]
    shipping_methods?: string[]
    shippingOptions?: any[]
    shipping_options?: any[]
    isCod?: boolean
    isPickup?: boolean
    isDelivery?: boolean
    isOnline?: boolean
    isOnsite?: boolean
    isHomeService?: boolean
    is_cod?: boolean
    is_pickup?: boolean
    is_delivery?: boolean
    is_online?: boolean
    is_onsite?: boolean
    is_home_service?: boolean
  }
  quantity: number
}

/**
 * Helper to reliably extract shipping/service method IDs from a product.
 * Handles shippingOptions array, shippingMethods strings, and boolean flags as fallback.
 */
export function getProductShippingMethods(product: any): string[] {
  let methods: string[] = [];
  
  const shippingOpts = product.shippingOptions || product.shipping_options || [];
  if (shippingOpts.length > 0 && typeof shippingOpts[0] === 'object') {
    methods = shippingOpts.map((opt: any) => String(opt.type || opt.id || ""));
  } else if (product.shippingMethods || product.shipping_methods) {
    methods = product.shippingMethods || product.shipping_methods || [];
  }
  
  // If still empty, try fallback to boolean flags
  if (methods.length === 0) {
    if (product.type === "barang") {
      if (product.isCod || product.is_cod) methods.push("cod");
      if (product.isPickup || product.is_pickup) methods.push("pickup");
      if (product.isDelivery || product.is_delivery) methods.push("delivery");
    } else {
      if (product.isOnline || product.is_online) methods.push("online");
      if (product.isOnsite || product.is_onsite) methods.push("onsite");
      if (product.isHomeService || product.is_home_service) methods.push("home_service");
    }
  }

  // Normalize "gratis" to "pickup" to match logic if they are functionally same, though usually string match is needed
  return methods.map(m => m === "gratis" ? "pickup" : m);
}

export interface ValidationResult {
  valid: boolean
  error?: string
  type?: "barang" | "jasa"
  commonMethod?: string
}

/**
 * Validate multiple checkout rules
 */
export function validateMultipleCheckout(items: CheckoutItem[]): ValidationResult {
  // Rule 1: Max 3 items
  if (items.length > 3) {
    return {
      valid: false,
      error: "Maksimal 3 item per checkout"
    }
  }

  // Rule 2: No cross-type (barang vs jasa)
  const types = items.map(item => item.product.type)
  const uniqueTypes = [...new Set(types)]
  
  if (uniqueTypes.length > 1) {
    return {
      valid: false,
      error: "Tidak bisa checkout barang dan jasa bersamaan. Lakukan checkout terpisah."
    }
  }

  if (items.length === 0) {
    return {
      valid: true,
      commonMethod: undefined
    }
  }

  const itemType = items[0].product.type

  // Rule 3: At least 1 common method in all items
  if (items.length > 1) {
    const methodsList = items.map(item => new Set(getProductShippingMethods(item.product)))

    // Find intersection of all sets
    const commonMethods = Array.from(methodsList[0]).filter(method =>
      methodsList.every(set => set.has(method))
    )

    if (commonMethods.length === 0) {
      return {
        valid: false,
        error: `Tidak ada metode ${itemType === "jasa" ? "layanan" : "pengiriman"} yang sama di semua item. Lakukan checkout terpisah atau pilih item yang punya metode yang sama.`,
        type: itemType
      }
    }

    return {
      valid: true,
      type: itemType,
      commonMethod: commonMethods[0]
    }
  }

  return {
    valid: true,
    type: itemType,
    commonMethod: undefined
  }
}

/**
 * Get common methods across multiple items
 */
export function getCommonMethods(items: CheckoutItem[]): string[] {
  if (items.length === 0) return []
  
  const methodsList = items.map(item => new Set(getProductShippingMethods(item.product)))

  return Array.from(methodsList[0]).filter(method =>
    methodsList.every(set => set.has(method))
  )
}
