export const EMAIL_VERIFICATION_CODE_LENGTH = 6;
export const EMAIL_VERIFICATION_DEMO_CODE = "123456";

export function maskEmail(email: string): string {
  return email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
}
