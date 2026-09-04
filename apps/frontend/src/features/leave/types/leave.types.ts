export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  isPaid: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

export interface CreateLeavePayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}
