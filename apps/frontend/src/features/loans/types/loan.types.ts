export interface LoanType {
  id: string;
  name: string;
  maxAmount: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  employeeName: string;
  loanType: string;
  amount: number;
  remaining: number;
  monthlyDeduction: number;
  startDate: string;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  installments: LoanInstallment[];
}

export interface LoanInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'MISSED';
}

export interface CreateLoanPayload {
  loanTypeId: string;
  amount: number;
}
