import { api } from "@/lib/api-client";
import type { Employee, CreateEmployeePayload } from "../types/employee.types";

function mapStatus(backendStatus: string): Employee["status"] {
  switch (backendStatus) {
    case "ACTIVE": return "active";
    case "ON_LEAVE": return "on-leave";
    case "TERMINATED":
    case "SUSPENDED":
    default: return "inactive";
  }
}

function mapEmployee(raw: Record<string, unknown>): Employee {
  const dept = raw.department as Record<string, unknown> | string | null | undefined;
  const pos = raw.position as Record<string, unknown> | string | null | undefined;
  const user = raw.user as Record<string, unknown> | null | undefined;

  return {
    id: String(raw.id ?? ""),
    firstName: String(raw.firstName ?? ""),
    lastName: String(raw.lastName ?? ""),
    email: typeof user?.email === "string" ? user.email : "",
    phone: (raw.phone as string) ?? undefined,
    position: pos && typeof pos === "object" && pos !== null && "name" in pos
      ? { id: String(pos.id ?? ""), name: String(pos.name ?? ""), ...pos } as Employee["position"]
      : (pos as string) ?? "",
    department: dept && typeof dept === "object" && dept !== null && "name" in dept
      ? { id: String(dept.id ?? ""), name: String(dept.name ?? ""), ...dept } as Employee["department"]
      : (dept as string) ?? "",
    status: mapStatus(String(raw.status ?? "ACTIVE")),
    joinDate: raw.hireDate ? String(raw.hireDate).slice(0, 10) : raw.createdAt ? String(raw.createdAt).slice(0, 10) : "",
    avatar: (raw.avatar as string) ?? undefined,
  };
}

export const employeesApi = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get<{ data: Record<string, unknown>[]; total: number }>("/employees", { params });
    return {
      data: res.data.map(mapEmployee),
      total: res.total,
    };
  },

  getById: async (id: string) => {
    const res = await api.get<Record<string, unknown>>(`/employees/${id}`);
    return mapEmployee(res);
  },

  create: (payload: CreateEmployeePayload) =>
    api.post<Employee>("/employees", payload),

  update: (id: string, payload: Partial<CreateEmployeePayload>) =>
    api.put<Employee>(`/employees/${id}`, payload),

  delete: (id: string) => api.delete(`/employees/${id}`),
};
