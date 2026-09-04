import { api } from "@/lib/api-client";
import type { LoginPayload, AuthResponse, User } from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get<User>("/auth/me"),
};
