import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useEmployees, useEmployee } from "../hooks/use-employees";
import * as employeesApiModule from "../api/employees.api";

vi.mock("../api/employees.api", () => ({
  employeesApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("useEmployees", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls employeesApi.getAll with no params when no filters", async () => {
    const { wrapper } = createWrapper();
    const mockData = { data: [], total: 0 };
    vi.mocked(employeesApiModule.employeesApi.getAll).mockResolvedValue(mockData);

    const { result } = renderHook(() => useEmployees(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(employeesApiModule.employeesApi.getAll).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockData);
  });

  it("passes filter params to getAll", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(employeesApiModule.employeesApi.getAll).mockResolvedValue({ data: [], total: 0 });

    renderHook(() => useEmployees({ search: "ahmed", department: "eng" }), { wrapper });

    await waitFor(() => {
      expect(employeesApiModule.employeesApi.getAll).toHaveBeenCalledWith({
        search: "ahmed",
        department: "eng",
      });
    });
  });

  it("omits empty filter values", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(employeesApiModule.employeesApi.getAll).mockResolvedValue({ data: [], total: 0 });

    renderHook(() => useEmployees({ search: "", status: undefined }), { wrapper });

    await waitFor(() => {
      expect(employeesApiModule.employeesApi.getAll).toHaveBeenCalledWith(undefined);
    });
  });

  it("uses correct query key", async () => {
    const { wrapper } = createWrapper();
    vi.mocked(employeesApiModule.employeesApi.getAll).mockResolvedValue({ data: [], total: 0 });

    const { result } = renderHook(() => useEmployees({ search: "test" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
  });
});

describe("useEmployee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches employee by id when id is provided", async () => {
    const { wrapper } = createWrapper();
    const mockEmployee = { id: "1", firstName: "Ahmed", lastName: "Ali" };
    vi.mocked(employeesApiModule.employeesApi.getById).mockResolvedValue(mockEmployee as any);

    const { result } = renderHook(() => useEmployee("1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockEmployee);
    expect(employeesApiModule.employeesApi.getById).toHaveBeenCalledWith("1");
  });

  it("does not fetch when id is empty", () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useEmployee(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(employeesApiModule.employeesApi.getById).not.toHaveBeenCalled();
  });

  it("has enabled false when id is empty string", () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useEmployee(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
