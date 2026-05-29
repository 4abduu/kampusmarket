export const BANK_OPTIONS = [
  { id: "bca", name: "Bank BCA" },
  { id: "mandiri", name: "Bank Mandiri" },
  { id: "bri", name: "Bank BRI" },
  { id: "bni", name: "Bank BNI" },
  { id: "bsi", name: "Bank BSI" },
  { id: "cimb", name: "Bank CIMB Niaga" },
  { id: "danamon", name: "Bank Danamon" },
  { id: "permata", name: "Bank Permata" },
  { id: "panin", name: "Bank Panin" },
  { id: "ocbc", name: "Bank OCBC NISP" },
  { id: "jago", name: "Bank Jago" },
  { id: "seabank", name: "Sea Bank" },
  { id: "neobank", name: "Neo Bank" },
  { id: "lainnya", name: "Bank Lainnya" },
] as const

export const EWALLET_OPTIONS = [
  { id: "gopay", name: "GoPay" },
  { id: "ovo", name: "OVO" },
  { id: "dana", name: "DANA" },
  { id: "shopeepay", name: "ShopeePay" },
  { id: "linkaja", name: "LinkAja" },
  { id: "isaku", name: "i.saku" },
  { id: "sakuku", name: "Sakuku" },
  { id: "lainnya", name: "Lainnya" },
] as const

export const USER_DASHBOARD_ITEMS_PER_PAGE = 5

export const getDashboardTabFromPage = (page: string): string => {
  switch (page) {
    case "my-products":
      return "products"
    case "orders":
      return "orders"
    case "wallet":
      return "wallet"
    case "settings":
      return "settings"
    default:
      return "overview"
  }
}
