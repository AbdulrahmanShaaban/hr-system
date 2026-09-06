"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "../api/platform.api";
import type {
  CreatePlanPayload,
  UpdatePlanPayload,
} from "../types/platform.types";

interface CompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function usePlatformCompanies(params: CompaniesParams) {
  return useQuery({
    queryKey: ["platform", "companies", params],
    queryFn: () =>
      platformApi.companies.getAll({
        ...params,
        orderBy: "createdAt",
        order: "desc",
      }),
  });
}

export function usePlatformCompany(id: string) {
  return useQuery({
    queryKey: ["platform", "companies", id],
    queryFn: () => platformApi.companies.getById(id),
    enabled: !!id,
  });
}

export function useSuspendCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformApi.companies.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "companies"] });
    },
  });
}

export function useReactivateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformApi.companies.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "companies"] });
    },
  });
}

export function usePlatformPlans() {
  return useQuery({
    queryKey: ["platform", "plans"],
    queryFn: () => platformApi.plans.getAll(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => platformApi.plans.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePlanPayload }) =>
      platformApi.plans.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "plans"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformApi.plans.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "plans"] });
    },
  });
}
