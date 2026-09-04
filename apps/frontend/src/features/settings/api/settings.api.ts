import { api } from '@/lib/api-client';

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

export const settingsApi = {
  getCompany: () => api.get<CompanySettings>('/settings/company'),
  updateCompany: (data: Partial<CompanySettings>) =>
    api.patch<CompanySettings>('/settings/company', data),

  getLeaveTypes: () => api.get<LeaveType[]>('/settings/leave-types'),
  createLeaveType: (data: Omit<LeaveType, 'id'>) =>
    api.post<LeaveType>('/settings/leave-types', data),
  deleteLeaveType: (id: string) => api.delete(`/settings/leave-types/${id}`),

  getLoanTypes: () => api.get<LoanType[]>('/settings/loan-types'),
  createLoanType: (data: Omit<LoanType, 'id'>) =>
    api.post<LoanType>('/settings/loan-types', data),
  deleteLoanType: (id: string) => api.delete(`/settings/loan-types/${id}`),

  getShifts: () => api.get<Shift[]>('/settings/shifts'),
  createShift: (data: Omit<Shift, 'id'>) =>
    api.post<Shift>('/settings/shifts', data),
  deleteShift: (id: string) => api.delete(`/settings/shifts/${id}`),
};
