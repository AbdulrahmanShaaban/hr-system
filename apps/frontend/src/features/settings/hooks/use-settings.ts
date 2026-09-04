import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, CompanySettings, LeaveType, LoanType, Shift } from '../api/settings.api';

export function useCompanySettings() {
  return useQuery<CompanySettings>({
    queryKey: ['settings', 'company'],
    queryFn: () => settingsApi.getCompany(),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) => settingsApi.updateCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'company'] }),
  });
}

export function useLeaveTypes() {
  return useQuery<LeaveType[]>({
    queryKey: ['settings', 'leave-types'],
    queryFn: () => settingsApi.getLeaveTypes(),
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LeaveType, 'id'>) => settingsApi.createLeaveType(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'leave-types'] }),
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteLeaveType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'leave-types'] }),
  });
}

export function useLoanTypes() {
  return useQuery<LoanType[]>({
    queryKey: ['settings', 'loan-types'],
    queryFn: () => settingsApi.getLoanTypes(),
  });
}

export function useCreateLoanType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LoanType, 'id'>) => settingsApi.createLoanType(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'loan-types'] }),
  });
}

export function useDeleteLoanType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteLoanType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'loan-types'] }),
  });
}

export function useShifts() {
  return useQuery<Shift[]>({
    queryKey: ['settings', 'shifts'],
    queryFn: () => settingsApi.getShifts(),
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Shift, 'id'>) => settingsApi.createShift(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'shifts'] }),
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteShift(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'shifts'] }),
  });
}
