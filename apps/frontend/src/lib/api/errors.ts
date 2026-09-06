import { ApiError } from "@/lib/api/apiFetch"

export function getApiErrorMessage(
  error: unknown,
  fallback = "حدث خطأ ما",
): string {
  if (error instanceof ApiError) {
    return error.message || fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error.trim()) {
    return error
  }
  return fallback
}
