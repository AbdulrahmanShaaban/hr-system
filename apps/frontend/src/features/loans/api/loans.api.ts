import { api } from "@/lib/api-client";
import type { Loan, LoanType, CreateLoanPayload } from "../types/loan.types";

export const loansApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Loan[]; total: number }>("/loans", { params }),

  getById: (id: string) => api.get<Loan>(`/loans/${id}`),

  getLoanTypes: () => api.get<LoanType[]>("/loans/types"),

  create: (payload: CreateLoanPayload) =>
    api.post<Loan>("/loans", payload),

  update: (id: string, payload: Partial<CreateLoanPayload>) =>
    api.put<Loan>(`/loans/${id}`, payload),
};
