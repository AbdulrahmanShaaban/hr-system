"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollApi } from "../api/payroll.api";

export function usePayrollCycles() {
  return useQuery({
    queryKey: ["payroll", "cycles"],
    queryFn: payrollApi.getCycles,
  });
}

export function usePayrollCycle(id: string) {
  return useQuery({
    queryKey: ["payroll", "cycles", id],
    queryFn: () => payrollApi.getCycleById(id),
    enabled: !!id,
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { month: string; year: number }) =>
      payrollApi.createCycle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "cycles"] });
    },
  });
}

export function useProcessCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.processCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "cycles"] });
    },
  });
}

export function usePayslips(cycleId: string) {
  return useQuery({
    queryKey: ["payroll", "payslips", cycleId],
    queryFn: () => payrollApi.getPayslips(cycleId),
    enabled: !!cycleId,
  });
}
