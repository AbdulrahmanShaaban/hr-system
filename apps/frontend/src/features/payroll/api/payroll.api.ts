import { api } from "@/lib/api-client";
import type { PayrollCycle, Payslip } from "../types/payroll.types";

export const payrollApi = {
  getCycles: () => api.get<PayrollCycle[]>("/payroll/cycles"),

  createCycle: (payload: { month: number; year: number }) =>
    api.post<PayrollCycle>("/payroll/cycles", payload),

  processCycle: (id: string) =>
    api.post<PayrollCycle>(`/payroll/cycles/${id}/process`),

  finalizeCycle: (id: string) =>
    api.post<PayrollCycle>(`/payroll/cycles/${id}/finalize`),

  getPayslips: (cycleId: string) =>
    api.get<Payslip[]>(`/payroll/cycles/${cycleId}/payslips`),
};
