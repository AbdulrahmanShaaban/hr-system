import { api } from "@/lib/api-client";
import type { PayrollCycle, Payslip } from "../types/payroll.types";

export const payrollApi = {
  getCycles: () => api.get<{ data: PayrollCycle[] }>("/payroll/cycles"),

  getCycleById: (id: string) => api.get<PayrollCycle>(`/payroll/cycles/${id}`),

  createCycle: (payload: { month: string; year: number }) =>
    api.post<PayrollCycle>("/payroll/cycles", payload),

  processCycle: (id: string) =>
    api.post<PayrollCycle>(`/payroll/cycles/${id}/process`),

  getPayslips: (cycleId: string) =>
    api.get<{ data: Payslip[] }>(`/payroll/cycles/${cycleId}/payslips`),

  getPayslipById: (cycleId: string, payslipId: string) =>
    api.get<Payslip>(`/payroll/cycles/${cycleId}/payslips/${payslipId}`),
};
