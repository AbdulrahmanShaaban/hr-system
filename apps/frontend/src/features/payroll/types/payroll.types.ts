export interface PayslipItem {
  label: string;
  amount: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  bonuses: PayslipItem[];
  deductions: PayslipItem[];
  netPay: number;
  status: "pending" | "processed" | "paid";
}

export interface PayrollCycle {
  id: string;
  month: string;
  year: number;
  status: "draft" | "processing" | "completed";
  payslipCount: number;
  totalAmount: number;
  createdAt: string;
}

export type PayrollCycleStatus = PayrollCycle["status"];
