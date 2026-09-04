import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAttendanceReport(
    tenantId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: start, lte: end },
      },
      include: { employee: true },
    });

    const totalDays = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const halfDay = records.filter((r) => r.status === 'HALF_DAY').length;
    const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
    const holiday = records.filter((r) => r.status === 'HOLIDAY').length;
    const totalLateMinutes = records.reduce((s, r) => s + r.minutesLate, 0);
    const totalOvertimeMinutes = records.reduce(
      (s, r) => s + r.overtimeMinutes,
      0,
    );

    const departmentMap = new Map<string, { present: number; absent: number }>();
    for (const r of records) {
      const dept = r.employee.departmentId ?? 'unassigned';
      const entry = departmentMap.get(dept) ?? { present: 0, absent: 0 };
      if (r.status === 'PRESENT' || r.status === 'LATE') entry.present++;
      else entry.absent++;
      departmentMap.set(dept, entry);
    }

    const summary = {
      period: { startDate, endDate },
      totalDays,
      present,
      absent,
      late,
      halfDay,
      onLeave,
      holiday,
      totalLateMinutes,
      totalOvertimeMinutes,
      averageLateMinutes: totalDays ? totalLateMinutes / totalDays : 0,
      averageOvertimeMinutes: totalDays ? totalOvertimeMinutes / totalDays : 0,
      departmentBreakdown: Object.fromEntries(departmentMap),
    };

    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: `Attendance Report (${startDate} to ${endDate})`,
        type: 'ATTENDANCE',
        parameters: { startDate, endDate },
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { report, summary };
  }

  async generatePayrollReport(tenantId: string, payrollCycleId: string) {
    const cycle = await this.prisma.payrollCycle.findUnique({
      where: { id: payrollCycleId },
    });

    if (!cycle) {
      throw new NotFoundException('Payroll cycle not found');
    }

    const payslips = await this.prisma.payslip.findMany({
      where: { payrollCycleId },
      include: { employee: true, components: true },
    });

    const totalNetPay = payslips.reduce(
      (s, p) => s + Number(p.netPay),
      0,
    );
    const totalEarnings = payslips.reduce(
      (s, p) => s + Number(p.totalEarnings),
      0,
    );
    const totalDeductions = payslips.reduce(
      (s, p) => s + Number(p.totalDeductions),
      0,
    );
    const averageNetPay = payslips.length ? totalNetPay / payslips.length : 0;

    const departmentMap = new Map<
      string,
      { totalNetPay: number; count: number }
    >();
    for (const p of payslips) {
      const dept = p.employee.departmentId ?? 'unassigned';
      const entry = departmentMap.get(dept) ?? { totalNetPay: 0, count: 0 };
      entry.totalNetPay += Number(p.netPay);
      entry.count++;
      departmentMap.set(dept, entry);
    }

    const departmentBreakdown = Object.fromEntries(
      [...departmentMap.entries()].map(([k, v]) => [
        k,
        { totalNetPay: v.totalNetPay, count: v.count, average: v.count ? v.totalNetPay / v.count : 0 },
      ]),
    );

    const summary = {
      cycle: {
        id: cycle.id,
        month: cycle.month,
        year: cycle.year,
        status: cycle.status,
      },
      employeeCount: payslips.length,
      totalNetPay,
      totalEarnings,
      totalDeductions,
      averageNetPay,
      departmentBreakdown,
    };

    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: `Payroll Report (${cycle.year}-${String(cycle.month).padStart(2, '0')})`,
        type: 'PAYROLL',
        parameters: { payrollCycleId },
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { report, summary };
  }

  async generateEmployeeReport(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId },
      include: { department: true, role: true },
    });

    const totalEmployees = employees.length;
    const active = employees.filter((e) => e.status === 'ACTIVE').length;
    const terminated = employees.filter(
      (e) => e.status === 'TERMINATED',
    ).length;
    const onLeave = employees.filter((e) => e.status === 'ON_LEAVE').length;
    const suspended = employees.filter(
      (e) => e.status === 'SUSPENDED',
    ).length;

    const departmentMap = new Map<string, number>();
    for (const e of employees) {
      const dept = e.department?.name ?? 'unassigned';
      departmentMap.set(dept, (departmentMap.get(dept) ?? 0) + 1);
    }

    const roleMap = new Map<string, number>();
    for (const e of employees) {
      const role = e.role?.name ?? 'unassigned';
      roleMap.set(role, (roleMap.get(role) ?? 0) + 1);
    }

    const totalBasicSalary = employees.reduce(
      (s, e) => s + Number(e.basicSalary),
      0,
    );

    const summary = {
      totalEmployees,
      active,
      terminated,
      onLeave,
      suspended,
      departmentDistribution: Object.fromEntries(departmentMap),
      roleDistribution: Object.fromEntries(roleMap),
      averageBasicSalary: totalEmployees ? totalBasicSalary / totalEmployees : 0,
    };

    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: 'Employee Report',
        type: 'EMPLOYEE',
        parameters: {},
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { report, summary };
  }

  async getAllReports(tenantId: string) {
    return this.prisma.report.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReportById(reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}
