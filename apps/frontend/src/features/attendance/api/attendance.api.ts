import { api } from "@/lib/api-client";
import type { AttendanceRecord, AttendanceFilters } from "../types/attendance.types";

export const attendanceApi = {
  getAll: (filters?: AttendanceFilters) => {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.employeeId) params.employeeId = filters.employeeId;
    return api.get<{ data: AttendanceRecord[]; total: number }>("/attendance", { params: Object.keys(params).length ? params : undefined });
  },

  clockIn: (employeeId: string) =>
    api.post<AttendanceRecord>("/attendance/clock-in", { employeeId }),

  clockOut: (employeeId: string) =>
    api.post<AttendanceRecord>("/attendance/clock-out", { employeeId }),
};
