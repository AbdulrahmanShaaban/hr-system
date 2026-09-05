import { api } from "@/lib/api-client";
import type { Department, CreateDepartmentPayload } from "../types/department.types";

export const departmentsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Department[]; total: number }>("/departments", { params }),

  getById: (id: string) => api.get<Department>(`/departments/${id}`),

  create: (payload: CreateDepartmentPayload) =>
    api.post<Department>("/departments", payload),

  update: (id: string, payload: Partial<CreateDepartmentPayload>) =>
    api.put<Department>(`/departments/${id}`, payload),

  delete: (id: string) => api.delete(`/departments/${id}`),
};
