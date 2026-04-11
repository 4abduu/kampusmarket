import type { Step } from "@/components/pages/guest/forgot-password/forgotPassword.types";

export const OTP_EXPIRATION_SECONDS = 10 * 60;

export function formatCountdownValue(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function validateEmailFormat(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function validatePasswordStrength(password: string): string {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[A-Z]/.test(password)) return "Password harus mengandung huruf besar";
  if (!/[a-z]/.test(password)) return "Password harus mengandung huruf kecil";
  if (!/[0-9]/.test(password)) return "Password harus mengandung angka";
  return "";
}

export function getStepNumber(step: Step): 1 | 2 | 3 {
  switch (step) {
    case "email":
      return 1;
    case "otp":
      return 2;
    case "reset":
    case "success":
      return 3;
    default:
      return 1;
  }
}

export function getStepTitle(step: Step): string {
  switch (step) {
    case "email":
      return "Masukkan Email";
    case "otp":
      return "Verifikasi OTP";
    case "reset":
      return "Password Baru";
    case "success":
      return "Berhasil";
    default:
      return "";
  }
}
