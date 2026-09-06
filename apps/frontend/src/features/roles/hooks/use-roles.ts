"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../api/roles.api";
import type {
  CreateRolePayload,
  UpdateRolePayload,
  AssignableUser,
  RoleUser,
} from "../types/role.types";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.getAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function useRoleUsers(id: string) {
  return useQuery({
    queryKey: ["roles", id, "users"],
    queryFn: () => rolesApi.getRoleUsers(id),
    enabled: !!id,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["roles", "all-users"],
    queryFn: () => rolesApi.getAllUsers(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      rolesApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id, "users"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      rolesApi.assignPermissions(id, permissionIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
}

export function useAssignUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      rolesApi.assignUser(roleId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.roleId, "users"] });
    },
  });
}

export function useUnassignUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: string; userIds: string[] }) =>
      rolesApi.unassignUsers(roleId, userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.roleId, "users"] });
    },
  });
}
