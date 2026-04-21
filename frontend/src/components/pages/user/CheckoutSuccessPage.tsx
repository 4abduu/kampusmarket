import BookingSuccessPage from "@/components/pages/user/BookingSuccessPage";
import PaymentSuccessPage from "@/components/pages/user/PaymentSuccessPage";
import type { NavigationData } from "@/app/navigation/types";

interface CheckoutSuccessPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  successType?: "product" | "service";
  orderId?: string;
}

export default function CheckoutSuccessPage({ onNavigate, successType = "product", orderId }: CheckoutSuccessPageProps) {
  if (successType === "service") {
    return <BookingSuccessPage onNavigate={onNavigate} orderId={orderId} />;
  }

  return <PaymentSuccessPage onNavigate={onNavigate} orderId={orderId} />;
}
