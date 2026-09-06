export type RequestType = "OVERTIME" | "GENERAL";

export type RequestStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface RequestItem {
  id: string;
  type: RequestType;
  title: string | null;
  reason: string | null;
  date: string | null;
  hours: number | null;
  status: RequestStatus;
  approvalLevel: number;
  employeeName: string | null;
  employeeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestPayload {
  type: RequestType;
  title?: string;
  reason?: string;
  date?: string;
  hours?: number;
}

export interface RequestListParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | "ALL";
  type?: RequestType | "ALL";
  order?: "asc" | "desc";
  mine?: "1";
}

export interface PageMeta {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RequestListResponse {
  data: RequestItem[];
  meta?: PageMeta;
}

export const STATUS_AR: Record<RequestStatus, string> = {
  PENDING: "بانتظار المدير",
  IN_REVIEW: "بانتظار الموارد البشرية",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
  CANCELLED: "ملغى",
};

export const TYPE_AR: Record<RequestType, string> = {
  OVERTIME: "عمل إضافي",
  GENERAL: "طلب عام",
};

export const STATUS_BADGE_VARIANT: Record<RequestStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  APPROVED: "success",
  PENDING: "warning",
  IN_REVIEW: "info",
  REJECTED: "danger",
  CANCELLED: "default",
};
