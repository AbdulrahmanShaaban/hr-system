export interface ApprovalStep {
  id: string;
  entityType: string;
  entityId: string;
  stepOrder: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  approverId: string;
  approver?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}
