export type OnboardingStep =
  | "PRICING"
  | "ATTENDANCE"
  | "PAYROLL"
  | "BENEFITS"
  | "EMPLOYEES"
  | "COMPLETE"
  | null;

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | null;

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  onboardingStep: OnboardingStep;
  onboardingCompletedAt: string | null;
  isPlatformAdmin: boolean;
  isPortalUser: boolean;
  permissions: string[];
  subscriptionStatus: SubscriptionStatus;
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

export interface RegisterPayload {
  companyName: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  jobTitle: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
