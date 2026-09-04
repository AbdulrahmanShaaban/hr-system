"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansApi } from "../api/loans.api";
import type { CreateLoanPayload } from "../types/loan.types";

export function useLoans(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["loans", filters],
    queryFn: () => loansApi.getAll(filters),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ["loans", id],
    queryFn: () => loansApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoanPayload) => loansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLoanPayload> }) =>
      loansApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}
