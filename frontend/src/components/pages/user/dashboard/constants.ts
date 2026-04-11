export const BANK_OPTIONS = [
  { id: "bca", name: "Bank BCA", logo: "🏦" },
  { id: "mandiri", name: "Bank Mandiri", logo: "🏦" },
  { id: "bri", name: "Bank BRI", logo: "🏦" },
  { id: "bni", name: "Bank BNI", logo: "🏦" },
  { id: "bsi", name: "Bank BSI", logo: "🏦" },
  { id: "cimb", name: "Bank CIMB Niaga", logo: "🏦" },
  { id: "danamon", name: "Bank Danamon", logo: "🏦" },
  { id: "permata", name: "Bank Permata", logo: "🏦" },
  { id: "panin", name: "Bank Panin", logo: "🏦" },
  { id: "ocbc", name: "Bank OCBC NISP", logo: "🏦" },
  { id: "jago", name: "Bank Jago", logo: "🏦" },
  { id: "seabank", name: "Sea Bank", logo: "🏦" },
  { id: "neobank", name: "Neo Bank", logo: "🏦" },
  { id: "lainnya", name: "Bank Lainnya", logo: "🏦" },
] as const

export const EWALLET_OPTIONS = [
  { id: "gopay", name: "GoPay", logo: "💚" },
  { id: "ovo", name: "OVO", logo: "💜" },
  { id: "dana", name: "DANA", logo: "💙" },
  { id: "shopeepay", name: "ShopeePay", logo: "🧡" },
  { id: "linkaja", name: "LinkAja", logo: "❤️" },
  { id: "isaku", name: "i.saku", logo: "💛" },
  { id: "sakuku", name: "Sakuku", logo: "💙" },
  { id: "lainnya", name: "Lainnya", logo: "📱" },
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
