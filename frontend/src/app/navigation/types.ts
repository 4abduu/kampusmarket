export interface NavigationData {
  category?: string;
  userName?: string;
  userEmail?: string;
  registeredEmail?: string;
  searchQuery?: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  chatAction?: "chat" | "nego";
  successType?: "product" | "service";
}

export type UserRole = "user" | "admin" | null;

export interface GooglePendingSession {
  token: string;
  tokenType: string;
  userName?: string;
  userEmail?: string;
}

export type NavigateFn = (page: string, data?: string | NavigationData) => void;
