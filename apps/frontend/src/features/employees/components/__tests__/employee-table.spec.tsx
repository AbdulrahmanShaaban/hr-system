import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { EmployeeTable } from "../employee-table";
import type { Employee } from "../../types/employee.types";

vi.mock("../hooks/use-employees", () => ({
  useDeleteEmployee: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/components/ui/toaster", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("next/link", () => {
  return {
    default: ({ children, href, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Ahmed",
    lastName: "Ali",
    email: "ahmed@example.com",
    position: "Developer",
    department: "Engineering",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    firstName: "Sara",
    lastName: "Mohamed",
    email: "sara@example.com",
    position: "Designer",
    department: "Design",
    status: "on-leave",
    joinDate: "2023-06-01",
  },
  {
    id: "3",
    firstName: "Omar",
    lastName: "Hassan",
    email: "omar@example.com",
    position: "Manager",
    department: "Operations",
    status: "inactive",
    joinDate: "2022-03-20",
  },
];

describe("EmployeeTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders employee names", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Ahmed Ali").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Sara Mohamed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Omar Hassan").length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee emails", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("ahmed@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("sara@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("omar@example.com").length).toBeGreaterThanOrEqual(1);
  });

  it("renders status badges", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("نشط").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("في إجازة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("غير نشط").length).toBeGreaterThanOrEqual(1);
  });

  it("renders join dates", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("2024-01-15").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2023-06-01").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2022-03-20").length).toBeGreaterThanOrEqual(1);
  });

  it("renders positions and departments", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Developer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Engineering").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Designer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Design").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when data is empty", () => {
    render(<EmployeeTable data={[]} />, { wrapper: createWrapper() });

    expect(screen.getAllByText("لم يتم العثور على موظفين.").length).toBeGreaterThanOrEqual(1);
  });

  it("renders view and edit action buttons for each employee", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    const viewButtons = screen.getAllByLabelText("عرض الموظف");
    const editButtons = screen.getAllByLabelText("تعديل الموظف");
    expect(viewButtons.length).toBeGreaterThanOrEqual(3);
    expect(editButtons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders delete buttons", () => {
    render(<EmployeeTable data={mockEmployees} />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByLabelText("حذف الموظف");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
  });
});
