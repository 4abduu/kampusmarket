import CheckoutSuccessfulPage from "@/components/pages/user/checkout/CheckoutSuccessfulPage";
import type { NavigationData } from "@/app/navigation/types";

interface CheckoutSuccessPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  successType?: "product" | "service";
  orderId?: string;
}

export default function CheckoutSuccessPage({ onNavigate, orderId }: CheckoutSuccessPageProps) {
  return <CheckoutSuccessfulPage onNavigate={onNavigate} orderId={orderId} />;
}
