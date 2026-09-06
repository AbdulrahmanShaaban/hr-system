"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import type {
  RequestListParams,
  CreateRequestPayload,
} from "../types/request.types";

export function useRequestList(params?: RequestListParams) {
  return useQuery({
    queryKey: ["requests", "list", params],
    queryFn: () => requestsApi.list(params),
  });
}

export function useMyRequests(params?: Omit<RequestListParams, "mine">) {
  return useQuery({
    queryKey: ["requests", "mine", params],
    queryFn: () => requestsApi.list({ ...params, mine: "1" }),
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ["requests", "detail", id],
    queryFn: () => requestsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote?: string }) =>
      requestsApi.approve(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote?: string }) =>
      requestsApi.reject(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
