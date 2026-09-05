"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "../api/departments.api";
import type { CreateDepartmentPayload } from "../types/department.types";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.getAll(),
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => departmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateDepartmentPayload> }) =>
      departmentsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}
