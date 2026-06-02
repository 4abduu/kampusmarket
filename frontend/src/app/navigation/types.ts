export interface NavigationData {
  category?: string;
  userName?: string;
  userEmail?: string;
  registeredEmail?: string;
  emailVerificationSource?: "register" | "settings" | "forgot-password";
  forgotPasswordEmail?: string;
  forgotPasswordSource?: "register" | "settings";
  searchQuery?: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  chatAction?: "chat" | "nego";
  buyerId?: string;
  successType?: "product" | "service";
  negoPrice?: number;
}

export type UserRole = "user" | "admin" | null;

export interface GooglePendingSession {
  token: string;
  tokenType: string;
  userName?: string;
  userEmail?: string;
}

export type NavigateFn = (page: string, data?: string | NavigationData) => void;
