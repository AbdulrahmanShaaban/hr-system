import { api } from "@/lib/api-client";
import type { Employee, CreateEmployeePayload } from "../types/employee.types";

export const employeesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Employee[]; total: number }>("/employees", { params }),

  getById: (id: string) => api.get<Employee>(`/employees/${id}`),

  create: (payload: CreateEmployeePayload) =>
    api.post<Employee>("/employees", payload),

  update: (id: string, payload: Partial<CreateEmployeePayload>) =>
    api.put<Employee>(`/employees/${id}`, payload),

  delete: (id: string) => api.delete(`/employees/${id}`),
};
