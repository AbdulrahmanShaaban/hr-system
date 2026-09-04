export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';
  minutesLate: number;
  overtimeMinutes: number;
  notes: string | null;
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
}
