import { api } from "@/lib/api-client";
import type { Role, CreateRolePayload } from "../types/role.types";

export const rolesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Role[]; total: number }>("/roles", { params }),

  getById: (id: string) => api.get<Role>(`/roles/${id}`),

  create: (payload: CreateRolePayload) =>
    api.post<Role>("/roles", payload),

  update: (id: string, payload: Partial<CreateRolePayload>) =>
    api.put<Role>(`/roles/${id}`, payload),

  delete: (id: string) => api.delete(`/roles/${id}`),

  getPermissions: () =>
    api.get<{ data: { id: string; name: string; code: string }[] }>("/roles/permissions"),

  assignPermissions: (id: string, permissionIds: string[]) =>
    api.put(`/roles/${id}/permissions`, { permissionIds }),
};
