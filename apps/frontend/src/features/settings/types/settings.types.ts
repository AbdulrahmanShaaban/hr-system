export interface CompanySettings {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  logo: string | null;
}

export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  isPaid: boolean;
  carriesForward: boolean;
}

export interface LoanType {
  id: string;
  name: string;
  maxAmount: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
}

export type SettingsTab = 'company' | 'leave-types' | 'loan-types' | 'shifts';
