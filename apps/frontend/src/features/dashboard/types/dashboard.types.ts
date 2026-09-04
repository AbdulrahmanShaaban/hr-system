export interface KpiData {
  totalEmployees: number;
  activeToday: number;
  pendingLeave: number;
  payrollStatus: string;
  employeeTrend?: number;
  activeTrend?: number;
  leaveTrend?: number;
  payrollTrend?: number;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: KpiData;
  recentActivity: Activity[];
}
