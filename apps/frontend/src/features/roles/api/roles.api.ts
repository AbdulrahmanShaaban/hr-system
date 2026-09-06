import { api } from "@/lib/api-client";
import type {
  Role,
  RoleUser,
  AssignableUser,
  CreateRolePayload,
  UpdateRolePayload,
} from "../types/role.types";

export const rolesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Role[]; total: number }>("/roles", { params }),

  getById: (id: string) => api.get<Role>(`/roles/${id}`),

  create: (payload: CreateRolePayload) =>
    api.post<Role>("/roles", payload),

  update: (id: string, payload: UpdateRolePayload) =>
    api.patch<Role>(`/roles/${id}`, payload),

  delete: (id: string) => api.delete(`/roles/${id}`),

  getPermissions: () =>
    api.get<{ data: { id: string; name: string; code: string }[] }>("/roles/permissions"),

  assignPermissions: (id: string, permissionIds: string[]) =>
    api.put(`/roles/${id}/permissions`, { permissionIds }),

  getRoleUsers: (id: string) =>
    api.get<RoleUser[]>(`/roles/${id}/users`),

  getAllUsers: () =>
    api.get<AssignableUser[]>("/roles/users"),

  assignUser: (roleId: string, userId: string) =>
    api.patch(`/users/${userId}/role`, { roleId }),

  unassignUsers: (roleId: string, userIds: string[]) =>
    api.post(`/roles/${roleId}/users/unassign`, { userIds }),
};
