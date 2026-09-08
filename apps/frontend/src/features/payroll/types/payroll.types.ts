export interface PayslipComponent {
  id: string;
  payslipId: string;
  salaryComponentId: string;
  name: string;
  type: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payrollCycleId: string;
  employeeId: string;
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  daysPresent: number;
  daysAbsent: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  overtimeMinutes: number;
  components: PayslipComponent[];
  employee?: { id: string; firstName: string; lastName: string; [key: string]: unknown };
}

export interface PayrollCycle {
  id: string;
  tenantId: string;
  month: number;
  year: number;
  status: "DRAFT" | "PROCESSING" | "COMPLETED" | "FINALIZED" | "PAID";
  lockedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PayrollCycleStatus = PayrollCycle["status"];
