"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../api/employees.api";
import type { EmployeeFilters, CreateEmployeePayload } from "../types/employee.types";

export function useEmployees(filters?: EmployeeFilters) {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.department) params.department = filters.department;
  if (filters?.status) params.status = filters.status;

  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => employeesApi.getAll(Object.keys(params).length ? params : undefined),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEmployeePayload> }) =>
      employeesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
