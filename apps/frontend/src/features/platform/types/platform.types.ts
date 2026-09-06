export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";

export interface PlatformPlan {
  id: string;
  name: string;
  maxEmployees: number;
  monthlyPrice: string | number;
  isActive: boolean;
  _count?: { companies: number };
  createdAt: string;
  updatedAt: string;
}

export interface PlatformCompany {
  id: string;
  name: string;
  establishmentNumber: string | null;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  billingCycle: string | null;
  createdAt: string;
  plan: { id: string; name: string; maxEmployees: number } | null;
  _count: { employees: number; users: number };
  users: { email: string; isPlatformAdmin: boolean }[];
}

export interface PlatformCompanyDetail extends PlatformCompany {
  address: string | null;
  phone: string | null;
  email: string | null;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  maxEmployees: number;
  monthlyPrice: number;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface PlatformCompaniesResponse {
  data: PlatformCompany[];
  meta?: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
