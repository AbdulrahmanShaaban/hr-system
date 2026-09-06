import { api } from "@/lib/api-client"

export { ApiError } from "@/lib/api-client"

type ApiFetchOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string>
  headers?: Record<string, string>
  skipAuth?: boolean
  skipRefresh?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, params, headers, skipAuth: _skipAuth, skipRefresh: _skipRefresh } = options

  const opts: { params?: Record<string, string>; headers?: Record<string, string> } = {}
  if (params) opts.params = params
  if (headers) opts.headers = headers

  switch (method.toUpperCase()) {
    case "POST":
      return api.post<T>(path, body, opts)
    case "PUT":
      return api.put<T>(path, body, opts)
    case "PATCH":
      return api.patch<T>(path, body, opts)
    case "DELETE":
      return api.delete<T>(path, opts)
    default:
      return api.get<T>(path, opts)
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "حدث خطأ ما",
): string {
  if (error instanceof Error && "status" in error) {
    const apiErr = error as { message: string; status: number }
    return apiErr.message || fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error.trim()) {
    return error
  }
  return fallback
}
