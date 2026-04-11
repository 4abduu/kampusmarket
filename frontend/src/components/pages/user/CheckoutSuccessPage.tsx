import BookingSuccessPage from "@/components/pages/user/BookingSuccessPage";
import PaymentSuccessPage from "@/components/pages/user/PaymentSuccessPage";
import type { NavigationData } from "@/app/navigation/types";

interface CheckoutSuccessPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  successType?: "product" | "service";
}

export default function CheckoutSuccessPage({ onNavigate, successType = "product" }: CheckoutSuccessPageProps) {
  if (successType === "service") {
    return <BookingSuccessPage onNavigate={onNavigate} />;
  }

  return <PaymentSuccessPage onNavigate={onNavigate} />;
}
