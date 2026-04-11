import type { Product } from "@/lib/mock-data"

export const EMOJIS = [
  "😀", "😂", "🥰", "😍", "🙏", "👍", "👌", "❤️", "🔥", "⭐",
  "💰", "📦", "🚀", "✨", "🙌", "😅", "🤔", "😢", "😮", "🎉",
]

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  time: string
  isMe: boolean
  type: "text" | "product" | "nego" | "offer" | "image"
  product?: Product
  offerPrice?: number
  imageUrl?: string
}

export type ChatState = Record<string, ChatMessage[]>
