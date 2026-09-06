import { api } from "@/lib/api-client";

/** Mask an email for confirmation dialogs: ah********@n****.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const localMasked =
    local.length <= 2
      ? `${local[0] ?? ""}****`
      : `${local.slice(0, 2)}${"*".repeat(Math.min(8, Math.max(2, local.length - 2)))}`;

  const [name, ...rest] = domain.split(".");
  const tld = rest.join(".");
  const domainMasked =
    (name?.length ?? 0) <= 1
      ? `${name ?? ""}****`
      : `${name![0]}${"*".repeat(Math.min(4, Math.max(2, name!.length - 1)))}`;

  return tld
    ? `${localMasked}@${domainMasked}.${tld}`
    : `${localMasked}@${domainMasked}`;
}

export const FP_EMAIL_KEY = "qawam_fp_email";
export const FP_RESET_TOKEN_KEY = "qawam_fp_reset_token";

export function setForgotPasswordEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FP_EMAIL_KEY, email);
  sessionStorage.removeItem(FP_RESET_TOKEN_KEY);
}

export function getForgotPasswordEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(FP_EMAIL_KEY);
}

export function setForgotPasswordResetToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FP_RESET_TOKEN_KEY, token);
}

export function getForgotPasswordResetToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(FP_RESET_TOKEN_KEY);
}

export function isForgotPasswordVerified(): boolean {
  return Boolean(getForgotPasswordResetToken());
}

export function clearForgotPasswordSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(FP_EMAIL_KEY);
  sessionStorage.removeItem(FP_RESET_TOKEN_KEY);
}

export type ForgotPasswordResponse = {
  success: true;
  message: string;
  devOtp?: string;
};

export function requestPasswordReset(email: string) {
  return api.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
}

export function verifyResetOtp(email: string, code: string) {
  return api.post<{ resetToken: string }>("/auth/verify-reset-otp", {
    email,
    code,
  });
}

export function resetPassword(resetToken: string, newPassword: string) {
  return api.post<{ success: true }>("/auth/reset-password", {
    resetToken,
    newPassword,
  });
}
