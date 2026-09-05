import { api } from "@/lib/api-client";
import type { ApprovalStep } from "../types/approval.types";

export const approvalsApi = {
  getPending: (approverId: string) =>
    api.get<ApprovalStep[]>(`/approvals/pending/${approverId}`),

  getForEntity: (entityType: string, entityId: string) =>
    api.get<ApprovalStep[]>(`/approvals/${entityType}/${entityId}`),

  approve: (id: string, comment?: string) =>
    api.post(`/approvals/${id}/approve`, { comment }),

  reject: (id: string, comment?: string) =>
    api.post(`/approvals/${id}/reject`, { comment }),
};
