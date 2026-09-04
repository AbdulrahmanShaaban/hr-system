export interface User {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department?: { id: string; name: string };
    role?: { id: string; name: string; permissions: Array<{ permission: { code: string } }> };
    shift?: { id: string; name: string };
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
