function normalizeApiUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

const API_BASE_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
);

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function setTokens(_accessToken: string, _refreshToken: string) {
  // Tokens are stored as HttpOnly cookies set by the backend.
  // We do NOT write to localStorage or document.cookie for security.
  // This function exists for API compatibility — the backend sets
  // the cookies via Set-Cookie response headers on /auth/login.
  // A short-lived non-sensitive token can be stored in memory for
  // optimistic UI gating if needed.
}

export function clearTokens() {
  // Cookies are cleared by the backend on /auth/logout.
  // We clear any client-side session state here.
  if (typeof window !== "undefined") {
    // Clear the auth query cache
    window.dispatchEvent(new Event("auth:logout"));
  }
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const method = fetchOptions.method || "GET";
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Credentials: "include" ensures HttpOnly cookies are sent with every request
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (method !== "GET" && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // CSRF protection: include token header on state-changing requests
  const csrfToken = getCsrfToken();
  if (csrfToken && method !== "GET") {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers,
    credentials: "include", // Send HttpOnly cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "حدث خطأ ما" }));
    throw new ApiError(error.message || `HTTP error ${response.status}`, response.status);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "GET", ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
