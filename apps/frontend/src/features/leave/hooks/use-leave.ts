"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "../api/leave.api";
import type { CreateLeavePayload } from "../types/leave.types";

export function useLeaveRequests(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["leave", "requests", filters],
    queryFn: () => leaveApi.getRequests(filters),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave", "types"],
    queryFn: leaveApi.getTypes,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeavePayload) => leaveApi.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave", "requests"] });
    },
  });
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leaveApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave", "requests"] });
    },
  });
}
