import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ApiError,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  api,
} from "@/lib/api-client";

describe("ApiError", () => {
  it("creates error with message and status", () => {
    const err = new ApiError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
    expect(err.name).toBe("ApiError");
    expect(err instanceof Error).toBe(true);
  });
});

describe("token storage", () => {
  beforeEach(() => {
    clearTokens();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearTokens();
    sessionStorage.clear();
  });

  it("setTokens stores access and refresh tokens in memory", () => {
    setTokens("access-123", "refresh-456");
    expect(getAccessToken()).toBe("access-123");
    expect(getRefreshToken()).toBe("refresh-456");
  });

  it("setTokens stores access token in sessionStorage", () => {
    setTokens("access-abc", "refresh-def");
    const stored = sessionStorage.getItem("qawam_tokens");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.access).toBe("access-abc");
  });

  it("setTokens does not store refresh token in sessionStorage", () => {
    setTokens("access-abc", "refresh-def");
    const stored = JSON.parse(sessionStorage.getItem("qawam_tokens")!);
    expect(stored.refresh).toBeUndefined();
  });

  it("clearTokens clears all tokens", () => {
    setTokens("a", "b");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("clearTokens removes qawam_tokens from sessionStorage", () => {
    setTokens("a", "b");
    clearTokens();
    expect(sessionStorage.getItem("qawam_tokens")).toBeNull();
  });

  it("getAccessToken returns null when no tokens set", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("getRefreshToken returns null when no tokens set", () => {
    expect(getRefreshToken()).toBeNull();
  });
});

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearTokens();
  });

  afterEach(() => {
    clearTokens();
  });

  it("api.get calls fetch with GET method and correct URL", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: "test" }) };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    const result = await api.get("/employees");
    expect(result).toEqual({ data: "test" });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (globalThis.fetch as any).mock.calls[0];
    expect(url).toContain("/api/v1/employees");
    expect(options.method).toBe("GET");
  });

  it("api.post sends JSON body with Content-Type", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: "1" }) };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    await api.post("/employees", { name: "Ahmed" });

    const [, options] = (globalThis.fetch as any).mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ name: "Ahmed" }));
  });

  it("api.get includes Authorization header when tokens are set", async () => {
    setTokens("my-token", "my-refresh");
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    await api.get("/test");

    const [, options] = (globalThis.fetch as any).mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer my-token");
  });

  it("api.get does not include Authorization header when no token", async () => {
    clearTokens();
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    await api.get("/test");

    const [, options] = (globalThis.fetch as any).mock.calls[0];
    expect(options.headers["Authorization"]).toBeUndefined();
  });

  it("api.get appends query params to URL", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    await api.get("/search", { params: { q: "ahmed", page: "2" } });

    const [url] = (globalThis.fetch as any).mock.calls[0];
    expect(url).toContain("?q=ahmed&page=2");
  });

  it("throws ApiError on non-ok response", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: "Not found" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    try {
      await api.get("/missing");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(404);
      expect((e as ApiError).message).toBe("Not found");
    }
  });

  it("throws ApiError with default message when JSON parse fails", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid")),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    try {
      await api.get("/broken");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });
});
