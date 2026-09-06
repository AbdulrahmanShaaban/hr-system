function normalizeApiUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

const API_BASE_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
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

// In-memory token storage — primary (survives same-tab SPA navigation)
// sessionStorage backup — survives full page reloads but clears on tab close (XSS-safe)
let accessToken: string | null = null;
let refreshToken: string | null = null;

function loadTokensFromSessionStorage() {
  if (typeof window === "undefined") return;
  try {
    const stored = sessionStorage.getItem("qawam_tokens");
    if (stored) {
      const parsed = JSON.parse(stored) as { access: string; refresh: string };
      accessToken = parsed.access;
      refreshToken = parsed.refresh;
    }
  } catch {}
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("qawam_tokens", JSON.stringify({ access, refresh }));
    } catch {}
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("qawam_tokens");
    } catch {}
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) loadTokensFromSessionStorage();
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken) loadTokensFromSessionStorage();
  return refreshToken;
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

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (method !== "GET" && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Send access token via Authorization header (in-memory + sessionStorage backup)
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "حدث خطأ ما" }));

    // Global 401 handler — redirect to login (in-memory token lost on refresh)
    // Don't redirect if already on login/forgot-password/reset-password pages
    if (response.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      const isAuthPage = path.startsWith("/login") || path.startsWith("/forgot-password") || path.startsWith("/reset-password");
      if (!isAuthPage) {
        clearTokens();
        const loginUrl = new URL("/login", window.location.origin);
        loginUrl.searchParams.set("redirect", path);
        window.location.href = loginUrl.toString();
      }
    }

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
