import { api } from "@/lib/api-client";
import type { LeaveRequest, LeaveType, CreateLeavePayload } from "../types/leave.types";

export const leaveApi = {
  getRequests: (params?: Record<string, string>) =>
    api.get<{ data: LeaveRequest[]; total: number }>("/leaves", { params }),

  getTypes: () => api.get<LeaveType[]>("/leaves/types"),

  createRequest: (payload: CreateLeavePayload) =>
    api.post<LeaveRequest>("/leaves", payload),

  updateStatus: (id: string, status: string) =>
    api.patch<LeaveRequest>(`/leaves/${id}`, { status }),
};
