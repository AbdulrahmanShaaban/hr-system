import { api } from "@/lib/api-client";
import type {
  PlatformCompany,
  PlatformCompanyDetail,
  PlatformPlan,
  CreatePlanPayload,
  UpdatePlanPayload,
  PlatformCompaniesResponse,
} from "../types/platform.types";

interface CompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}

export const platformApi = {
  companies: {
    getAll: (params?: CompaniesParams) => {
      const searchParams: Record<string, string> = {};
      if (params?.page) searchParams.page = String(params.page);
      if (params?.limit) searchParams.limit = String(params.limit);
      if (params?.search) searchParams.search = params.search;
      if (params?.status && params.status !== "ALL")
        searchParams.status = params.status;
      if (params?.orderBy) searchParams.orderBy = params.orderBy;
      if (params?.order) searchParams.order = params.order;
      return api.get<PlatformCompaniesResponse>("/platform/companies", {
        params: searchParams,
      });
    },

    getById: (id: string) =>
      api.get<PlatformCompanyDetail>(`/platform/companies/${id}`),

    suspend: (id: string) =>
      api.patch<PlatformCompany>(`/platform/companies/${id}`, {
        subscriptionStatus: "SUSPENDED",
      }),

    reactivate: (id: string) =>
      api.patch<PlatformCompany>(`/platform/companies/${id}`, {
        subscriptionStatus: "ACTIVE",
      }),
  },

  plans: {
    getAll: () => api.get<PlatformPlan[]>("/platform/plans"),

    getById: (id: string) => api.get<PlatformPlan>(`/platform/plans/${id}`),

    create: (payload: CreatePlanPayload) =>
      api.post<PlatformPlan>("/platform/plans", payload),

    update: (id: string, payload: UpdatePlanPayload) =>
      api.patch<PlatformPlan>(`/platform/plans/${id}`, payload),

    delete: (id: string) => api.delete(`/platform/plans/${id}`),
  },
};
