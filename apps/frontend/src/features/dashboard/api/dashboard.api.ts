import { api } from "@/lib/api-client";
import type { DashboardData } from "../types/dashboard.types";

export const dashboardApi = {
  getData: () => api.get<DashboardData>("/dashboard"),
};
