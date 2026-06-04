import { appToast } from "@/hooks/use-app-toast";

/**
 * Opens WhatsApp chat with the given phone number and template message.
 * If no phone number is available, shows a toast notification.
 */
export function openWhatsApp(
  phone: string | undefined | null,
  sellerName: string,
  productTitle: string,
  isService: boolean = false
) {
  if (!phone || phone === "-" || phone.trim() === "") {
    appToast.error(`${sellerName} belum mencantumkan nomor WhatsApp`, "Silakan gunakan fitur Chat di aplikasi untuk menghubungi.");
    return;
  }

  // Normalize phone: remove spaces, dashes
  let cleaned = phone.replace(/[\s\-()]/g, "");
  // Convert leading 0 to 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  // If doesn't start with 62, add it
  if (!cleaned.startsWith("62") && !cleaned.startsWith("+62")) {
    cleaned = "62" + cleaned;
  }
  // Remove + prefix
  cleaned = cleaned.replace(/^\+/, "");

  const itemType = isService ? "layanan" : "produk";
  const message = encodeURIComponent(
    `Halo, saya ingin menanyakan ${itemType} "${productTitle}" di KampusMarket.`
  );

  window.open(`https://wa.me/${cleaned}?text=${message}`, "_blank");
}
