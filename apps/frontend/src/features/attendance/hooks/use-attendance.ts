"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance.api";
import type { AttendanceFilters } from "../types/attendance.types";

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: () => attendanceApi.getAll(filters),
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.clockIn(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.clockOut(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
