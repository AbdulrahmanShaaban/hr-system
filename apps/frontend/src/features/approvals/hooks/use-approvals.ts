"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../api/approvals.api";

export function usePendingApprovals(approverId: string) {
  return useQuery({
    queryKey: ["approvals", "pending", approverId],
    queryFn: () => approvalsApi.getPending(approverId),
    enabled: !!approverId,
  });
}

export function useApproveStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      approvalsApi.approve(id, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approvals"] }),
  });
}

export function useRejectStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      approvalsApi.reject(id, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approvals"] }),
  });
}
