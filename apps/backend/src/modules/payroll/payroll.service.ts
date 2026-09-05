import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ComponentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface FormulaNode {
  type: 'FIXED' | 'VARIABLE' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
  value?: number;
  variable?: string;
  left?: FormulaNode;
  right?: FormulaNode;
}

interface PayslipContext {
  base_salary: Decimal;
  days_present: number;
  days_absent: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  overtime_minutes: number;
  working_days: number;
  [key: string]: Decimal | number;
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  evaluateFormula(node: FormulaNode, ctx: PayslipContext): Decimal {
    switch (node.type) {
      case 'FIXED':
        return new Decimal(node.value ?? 0);

      case 'VARIABLE': {
        const val = ctx[node.variable ?? ''];
        if (val === undefined) {
          throw new BadRequestException(`Unknown variable: ${node.variable}`);
        }
        return val instanceof Decimal ? val : new Decimal(val);
      }

      case 'ADD':
        return this.evaluateFormula(node.left!, ctx).plus(
          this.evaluateFormula(node.right!, ctx),
        );

      case 'SUBTRACT':
        return this.evaluateFormula(node.left!, ctx).minus(
          this.evaluateFormula(node.right!, ctx),
        );

      case 'MULTIPLY':
        return this.evaluateFormula(node.left!, ctx).mul(
          this.evaluateFormula(node.right!, ctx),
        );

      case 'DIVIDE': {
        const divisor = this.evaluateFormula(node.right!, ctx);
        if (divisor.isZero()) {
          throw new BadRequestException('Division by zero in formula');
        }
        return this.evaluateFormula(node.left!, ctx).div(divisor);
      }

      default:
        throw new BadRequestException(`Unknown formula node type: ${(node as FormulaNode).type}`);
    }
  }

  async calculatePayslip(employeeId: string, payrollCycleId: string) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
      include: { shift: true },
    });

    const [cycle, components] = await Promise.all([
      this.prisma.payrollCycle.findUniqueOrThrow({
        where: { id: payrollCycleId },
      }),
      this.prisma.salaryComponent.findMany({
        where: { tenantId: employee.tenantId },
      }),
    ]);

    if (cycle.status === 'FINALIZED' || cycle.status === 'PAID') {
      throw new BadRequestException('Cannot process a finalized or paid cycle');
    }

    const year = cycle.year;
    const month = cycle.month;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const workingDays = endDate.getDate();

    const [attendances, leaveRequests, loanInstallments] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          employeeId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          employeeId,
          status: 'APPROVED',
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        include: { leaveType: true },
      }),
      this.prisma.loanInstallment.findMany({
        where: {
          loan: { employeeId, status: 'ACTIVE' },
          status: 'PENDING',
          dueDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    let daysPresent = 0;
    let daysAbsent = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let overtimeMinutes = 0;

    for (const att of attendances) {
      if (att.status === 'PRESENT' || att.status === 'LATE') {
        daysPresent++;
      } else if (att.status === 'ABSENT') {
        daysAbsent++;
      } else if (att.status === 'ON_LEAVE') {
        const leaveReq = leaveRequests.find(
          (lr) => att.date >= lr.startDate && att.date <= lr.endDate,
        );
        if (leaveReq?.leaveType.isPaid) {
          paidLeaveDays++;
        } else {
          unpaidLeaveDays++;
        }
      }
      overtimeMinutes += att.overtimeMinutes;
    }

    const ctx: PayslipContext = {
      base_salary: employee.basicSalary,
      days_present: daysPresent,
      days_absent: daysAbsent,
      paid_leave_days: paidLeaveDays,
      unpaid_leave_days: unpaidLeaveDays,
      overtime_minutes: overtimeMinutes,
      working_days: workingDays,
    };

    let totalEarnings = new Decimal(0);
    let totalDeductions = new Decimal(0);
    const payslipComponents: Array<{
      salaryComponentId: string;
      name: string;
      type: string;
      amount: Decimal;
    }> = [];

    for (const comp of components) {
      const amount = this.evaluateFormula(comp.formula as unknown as FormulaNode, ctx);
      payslipComponents.push({
        salaryComponentId: comp.id,
        name: comp.name,
        type: comp.type,
        amount,
      });
      if (comp.type === 'EARNING') {
        totalEarnings = totalEarnings.plus(amount);
      } else {
        totalDeductions = totalDeductions.plus(amount);
      }
    }

    let loanDeduction = new Decimal(0);
    for (const installment of loanInstallments) {
      loanDeduction = loanDeduction.plus(installment.amount);
    }
    totalDeductions = totalDeductions.plus(loanDeduction);

    const netPay = employee.basicSalary.plus(totalEarnings).minus(totalDeductions);

    const existing = await this.prisma.payslip.findUnique({
      where: { payrollCycleId_employeeId: { payrollCycleId, employeeId } },
    });

    if (existing) {
      await this.prisma.payslipComponent.deleteMany({
        where: { payslipId: existing.id },
      });
      return this.prisma.payslip.update({
        where: { id: existing.id },
        data: {
          basicSalary: employee.basicSalary,
          totalEarnings,
          totalDeductions,
          netPay,
          daysPresent,
          daysAbsent,
          paidLeaveDays,
          unpaidLeaveDays,
          overtimeMinutes,
          components: {
            create: payslipComponents.map((pc) => ({
              salaryComponentId: pc.salaryComponentId,
              name: pc.name,
              type: pc.type as ComponentType,
              amount: pc.amount,
            })),
          },
        },
        include: { components: true },
      });
    }

    return this.prisma.payslip.create({
      data: {
        payrollCycleId,
        employeeId,
        basicSalary: employee.basicSalary,
        totalEarnings,
        totalDeductions,
        netPay,
        daysPresent,
        daysAbsent,
        paidLeaveDays,
        unpaidLeaveDays,
        overtimeMinutes,
        components: {
          create: payslipComponents.map((pc) => ({
            salaryComponentId: pc.salaryComponentId,
            name: pc.name,
            type: pc.type as ComponentType,
            amount: pc.amount,
          })),
        },
      },
      include: { components: true },
    });
  }

  async finalizePayrollCycle(cycleId: string) {
    const cycle = await this.prisma.payrollCycle.findUniqueOrThrow({
      where: { id: cycleId },
      include: { payslips: true },
    });

    if (cycle.status !== 'COMPLETED') {
      throw new BadRequestException('Cycle must be COMPLETED before finalizing');
    }

    return this.prisma.payrollCycle.update({
      where: { id: cycleId },
      data: {
        status: 'FINALIZED',
        lockedAt: new Date(),
      },
    });
  }

  async adjustPayslip(
    employeeId: string,
    cycleId: string,
    adjustment: { type: 'CREDIT' | 'DEBIT'; amount: number; reason: string },
  ) {
    const cycle = await this.prisma.payrollCycle.findUniqueOrThrow({
      where: { id: cycleId },
    });

    if (cycle.status !== 'FINALIZED' && cycle.status !== 'PAID') {
      throw new BadRequestException('Adjustments can only be made to finalized or paid cycles');
    }

    return this.prisma.payrollAdjustment.create({
      data: {
        payrollCycleId: cycleId,
        employeeId,
        type: adjustment.type,
        amount: new Decimal(adjustment.amount),
        reason: adjustment.reason,
      },
    });
  }

  async createCycle(tenantId: string, month: number, year: number) {
    const existing = await this.prisma.payrollCycle.findUnique({
      where: { tenantId_month_year: { tenantId, month, year } },
    });
    if (existing) {
      throw new BadRequestException('A cycle for this month/year already exists');
    }
    return this.prisma.payrollCycle.create({
      data: { tenantId, month, year },
    });
  }

  async listCycles(tenantId: string) {
    return this.prisma.payrollCycle.findMany({
      where: { tenantId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async processCycle(cycleId: string) {
    const cycle = await this.prisma.payrollCycle.findUniqueOrThrow({
      where: { id: cycleId },
    });

    if (cycle.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT cycles can be processed');
    }

    await this.prisma.payrollCycle.update({
      where: { id: cycleId },
      data: { status: 'PROCESSING' },
    });

    const employees = await this.prisma.employee.findMany({
      where: { tenantId: cycle.tenantId, status: 'ACTIVE' },
    });

    const results = await Promise.allSettled(
      employees.map((emp) => this.calculatePayslip(emp.id, cycleId)),
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      const errors = failures.map((f) => (f as PromiseRejectedResult).reason?.message ?? 'Unknown');
      throw new BadRequestException(`Failed to process ${failures.length} payslips: ${errors.join('; ')}`);
    }

    return this.prisma.payrollCycle.update({
      where: { id: cycleId },
      data: { status: 'COMPLETED' },
    });
  }

  async getPayslips(cycleId: string) {
    return this.prisma.payslip.findMany({
      where: { payrollCycleId: cycleId },
      include: { components: true, employee: true },
    });
  }
}
