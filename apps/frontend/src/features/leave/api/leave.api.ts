import { api } from "@/lib/api-client";
import type { LeaveRequest, LeaveType, CreateLeavePayload } from "../types/leave.types";

export const leaveApi = {
  getRequests: (params?: Record<string, string>) =>
    api.get<{ data: LeaveRequest[]; total: number }>("/leave/requests", { params }),

  getTypes: () => api.get<LeaveType[]>("/leave/types"),

  createRequest: (payload: CreateLeavePayload) =>
    api.post<LeaveRequest>("/leave/requests", payload),

  updateStatus: (id: string, status: string) =>
    api.patch<LeaveRequest>(`/leave/requests/${id}`, { status }),
};
