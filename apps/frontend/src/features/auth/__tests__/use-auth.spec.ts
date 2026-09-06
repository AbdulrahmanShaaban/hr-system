import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "../hooks/use-auth";
import * as authApiModule from "../api/auth.api";
import * as apiClient from "@/lib/api-client";

vi.mock("../api/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client")>();
  return {
    ...actual,
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthenticated state initially", () => {
    const { wrapper } = createWrapper();
    vi.mocked(authApiModule.authApi.getMe).mockRejectedValue(new Error("no session"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it("login calls authApi.login and setTokens on success", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(authApiModule.authApi.getMe).mockRejectedValue(new Error("no session"));

    const mockResponse = {
      accessToken: "acc-123",
      refreshToken: "ref-456",
      user: { id: "1", email: "test@test.com" },
    };
    vi.mocked(authApiModule.authApi.login).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.login({ email: "test@test.com", password: "pass" });
    });

    await waitFor(() => {
      expect(authApiModule.authApi.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "pass",
      });
    });

    expect(apiClient.setTokens).toHaveBeenCalledWith("acc-123", "ref-456");
  });

  it("logout calls clearTokens and clears query cache", async () => {
    const { wrapper, queryClient } = createWrapper();
    vi.mocked(authApiModule.authApi.getMe).mockRejectedValue(new Error("no session"));
    vi.mocked(authApiModule.authApi.logout).mockResolvedValue(undefined as any);

    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const clearSpy = vi.spyOn(queryClient, "clear");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout(undefined as any);
    });

    expect(authApiModule.authApi.logout).toHaveBeenCalled();
    expect(apiClient.clearTokens).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  it("register calls authApi.register and setTokens on success", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(authApiModule.authApi.getMe).mockRejectedValue(new Error("no session"));

    const mockResponse = {
      accessToken: "acc-reg",
      refreshToken: "ref-reg",
      user: { id: "2", email: "new@test.com" },
    };
    vi.mocked(authApiModule.authApi.register).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        companyName: "Acme",
        email: "new@test.com",
        password: "pass123",
        fullName: "New User",
        phone: "555",
        jobTitle: "Dev",
      });
    });

    expect(apiClient.setTokens).toHaveBeenCalledWith("acc-reg", "ref-reg");
  });

  it("exposes loginError on failed login", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(authApiModule.authApi.getMe).mockRejectedValue(new Error("no session"));
    vi.mocked(authApiModule.authApi.login).mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.login({ email: "bad@test.com", password: "wrong" });
    });

    await waitFor(() => {
      expect(result.current.loginError).toBeDefined();
    });
  });

  it("returns user data when getMe succeeds", async () => {
    const { wrapper } = createWrapper();
    const mockUser = { id: "1", email: "me@test.com", isActive: true };
    vi.mocked(authApiModule.authApi.getMe).mockResolvedValue(mockUser as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
  });
});
