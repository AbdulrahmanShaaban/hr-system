import { api } from "@/lib/api-client";
import type {
  RequestItem,
  RequestListResponse,
  RequestListParams,
  CreateRequestPayload,
} from "../types/request.types";

export const requestsApi = {
  list: (params?: RequestListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.order) searchParams.set("order", params.order);
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.type && params.type !== "ALL")
      searchParams.set("type", params.type);
    if (params?.mine) searchParams.set("mine", params.mine);
    const qs = searchParams.toString();
    return api.get<RequestListResponse>(`/requests${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get<RequestItem>(`/requests/${id}`),

  create: (payload: CreateRequestPayload) =>
    api.post<RequestItem>("/requests", payload),

  cancel: (id: string) => api.delete(`/requests/${id}`),

  approve: (id: string, reviewNote?: string) =>
    api.patch<RequestItem>(`/requests/${id}/approve`, { reviewNote }),

  reject: (id: string, reviewNote?: string) =>
    api.patch<RequestItem>(`/requests/${id}/reject`, { reviewNote }),
};
