import { api } from "@/lib/api-client";
import type {
  LoginPayload,
  AuthResponse,
  User,
  RegisterPayload,
} from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get<User>("/auth/me"),
};
