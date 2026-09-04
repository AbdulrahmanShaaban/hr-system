export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "hr" | "employee";
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
