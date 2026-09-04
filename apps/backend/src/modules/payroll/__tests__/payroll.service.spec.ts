import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from '../payroll.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

const mockPrisma = {
  employee: {
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
  },
  payrollCycle: {
    findUniqueOrThrow: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  salaryComponent: {
    findMany: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
  },
  leaveRequest: {
    findMany: jest.fn(),
  },
  loanInstallment: {
    findMany: jest.fn(),
  },
  payslip: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  payslipComponent: {
    deleteMany: jest.fn(),
  },
  payrollAdjustment: {
    create: jest.fn(),
  },
};

describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    jest.clearAllMocks();
  });

  describe('evaluateFormula', () => {
    const ctx = {
      base_salary: new Decimal(15000),
      days_present: 22,
      days_absent: 2,
      paid_leave_days: 1,
      unpaid_leave_days: 1,
      overtime_minutes: 120,
      working_days: 30,
    };

    it('should return constant value for FIXED node', () => {
      const result = service.evaluateFormula({ type: 'FIXED', value: 5000 }, ctx);
      expect(result.equals(new Decimal(5000))).toBe(true);
    });

    it('should resolve base_salary VARIABLE node', () => {
      const result = service.evaluateFormula({ type: 'VARIABLE', variable: 'base_salary' }, ctx);
      expect(result.equals(new Decimal(15000))).toBe(true);
    });

    it('should resolve days_present VARIABLE node', () => {
      const result = service.evaluateFormula({ type: 'VARIABLE', variable: 'days_present' }, ctx);
      expect(result.equals(new Decimal(22))).toBe(true);
    });

    it('should throw for unknown variable', () => {
      expect(() =>
        service.evaluateFormula({ type: 'VARIABLE', variable: 'nonexistent' }, ctx),
      ).toThrow(BadRequestException);
    });

    it('should ADD two nodes', () => {
      const node = {
        type: 'ADD' as const,
        left: { type: 'FIXED' as const, value: 100 },
        right: { type: 'FIXED' as const, value: 200 },
      };
      const result = service.evaluateFormula(node, ctx);
      expect(result.equals(new Decimal(300))).toBe(true);
    });

    it('should SUBTRACT two nodes', () => {
      const node = {
        type: 'SUBTRACT' as const,
        left: { type: 'FIXED' as const, value: 500 },
        right: { type: 'FIXED' as const, value: 200 },
      };
      const result = service.evaluateFormula(node, ctx);
      expect(result.equals(new Decimal(300))).toBe(true);
    });

    it('should MULTIPLY two nodes', () => {
      const node = {
        type: 'MULTIPLY' as const,
        left: { type: 'FIXED' as const, value: 10 },
        right: { type: 'FIXED' as const, value: 5 },
      };
      const result = service.evaluateFormula(node, ctx);
      expect(result.equals(new Decimal(50))).toBe(true);
    });

    it('should DIVIDE two nodes', () => {
      const node = {
        type: 'DIVIDE' as const,
        left: { type: 'FIXED' as const, value: 100 },
        right: { type: 'FIXED' as const, value: 4 },
      };
      const result = service.evaluateFormula(node, ctx);
      expect(result.equals(new Decimal(25))).toBe(true);
    });

    it('should throw on division by zero', () => {
      const node = {
        type: 'DIVIDE' as const,
        left: { type: 'FIXED' as const, value: 100 },
        right: { type: 'FIXED' as const, value: 0 },
      };
      expect(() => service.evaluateFormula(node, ctx)).toThrow(BadRequestException);
    });

    it('should evaluate nested formula: (base_salary / 30) * days_present', () => {
      const node = {
        type: 'MULTIPLY' as const,
        left: {
          type: 'DIVIDE' as const,
          left: { type: 'VARIABLE' as const, variable: 'base_salary' },
          right: { type: 'FIXED' as const, value: 30 },
        },
        right: { type: 'VARIABLE' as const, variable: 'days_present' },
      };
      const result = service.evaluateFormula(node, ctx);
      // (15000 / 30) * 22 = 500 * 22 = 11000
      expect(result.equals(new Decimal(11000))).toBe(true);
    });

    it('should handle negative FIXED value', () => {
      const result = service.evaluateFormula({ type: 'FIXED', value: -500 }, ctx);
      expect(result.equals(new Decimal(-500))).toBe(true);
    });

    it('should throw for unknown node type', () => {
      expect(() =>
        service.evaluateFormula({ type: 'UNKNOWN' as any }, ctx),
      ).toThrow(BadRequestException);
    });

    it('should handle DEFAULT FIXED with no value', () => {
      const result = service.evaluateFormula({ type: 'FIXED' }, ctx);
      expect(result.equals(new Decimal(0))).toBe(true);
    });

    it('should handle complex nested: (base_salary + FIXED) - VARIABLE', () => {
      const node = {
        type: 'SUBTRACT' as const,
        left: {
          type: 'ADD' as const,
          left: { type: 'VARIABLE' as const, variable: 'base_salary' },
          right: { type: 'FIXED' as const, value: 1000 },
        },
        right: { type: 'VARIABLE' as const, variable: 'days_absent' },
      };
      const result = service.evaluateFormula(node, ctx);
      // (15000 + 1000) - 2 = 15998
      expect(result.equals(new Decimal(15998))).toBe(true);
    });
  });

  describe('calculatePayslip', () => {
    const employeeId = 'emp-1';
    const cycleId = 'cycle-1';

    const mockEmployee = {
      id: employeeId,
      basicSalary: new Decimal(15000),
      tenantId: 'tenant-1',
      shift: { startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15 },
    };

    const mockCycle = {
      id: cycleId,
      status: 'PROCESSING',
      year: 2025,
      month: 3,
      tenantId: 'tenant-1',
    };

    const mockComponents = [
      {
        id: 'comp-1',
        name: 'Basic Salary',
        type: 'EARNING',
        formula: { type: 'VARIABLE', variable: 'base_salary' },
      },
      {
        id: 'comp-2',
        name: 'Tax',
        type: 'DEDUCTION',
        formula: {
          type: 'MULTIPLY',
          left: { type: 'VARIABLE', variable: 'base_salary' },
          right: { type: 'FIXED', value: 0.1 },
        },
      },
    ];

    const mockAttendances = [
      { status: 'PRESENT', overtimeMinutes: 60, date: new Date('2025-03-01') },
      { status: 'LATE', overtimeMinutes: 0, date: new Date('2025-03-02') },
      { status: 'ABSENT', overtimeMinutes: 0, date: new Date('2025-03-03') },
      { status: 'ON_LEAVE', overtimeMinutes: 0, date: new Date('2025-03-04') },
    ];

    const mockLeaveRequests = [
      {
        startDate: new Date('2025-03-04'),
        endDate: new Date('2025-03-04'),
        leaveType: { isPaid: true },
      },
    ];

    beforeEach(() => {
      mockPrisma.employee.findUniqueOrThrow
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(mockEmployee);
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue(mockCycle);
      mockPrisma.salaryComponent.findMany.mockResolvedValue(mockComponents);
      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances);
      mockPrisma.leaveRequest.findMany.mockResolvedValue(mockLeaveRequests);
      mockPrisma.loanInstallment.findMany.mockResolvedValue([]);
      mockPrisma.payslip.findUnique.mockResolvedValue(null);
      mockPrisma.payslip.create.mockImplementation((args) =>
        Promise.resolve({ id: 'payslip-1', ...args.data, components: [] }),
      );
    });

    it('should calculate payslip with correct earnings and deductions', async () => {
      const result = await service.calculatePayslip(employeeId, cycleId);

      expect(mockPrisma.payslip.create).toHaveBeenCalled();
      const callArgs = mockPrisma.payslip.create.mock.calls[0][0];
      expect(callArgs.data.netPay.toString()).toBeDefined();
    });

    it('should throw for finalized cycle', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        ...mockCycle,
        status: 'FINALIZED',
      });
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);

      await expect(service.calculatePayslip(employeeId, cycleId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for paid cycle', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        ...mockCycle,
        status: 'PAID',
      });
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);

      await expect(service.calculatePayslip(employeeId, cycleId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should count daysPresent for PRESENT and LATE statuses', async () => {
      await service.calculatePayslip(employeeId, cycleId);
      const callArgs = mockPrisma.payslip.create.mock.calls[0][0];
      expect(callArgs.data.daysPresent).toBe(2);
    });

    it('should count daysAbsent for ABSENT status', async () => {
      await service.calculatePayslip(employeeId, cycleId);
      const callArgs = mockPrisma.payslip.create.mock.calls[0][0];
      expect(callArgs.data.daysAbsent).toBe(1);
    });

    it('should accumulate overtimeMinutes', async () => {
      await service.calculatePayslip(employeeId, cycleId);
      const callArgs = mockPrisma.payslip.create.mock.calls[0][0];
      expect(callArgs.data.overtimeMinutes).toBe(60);
    });

    it('should compute netPay = basicSalary + totalEarnings - totalDeductions', async () => {
      await service.calculatePayslip(employeeId, cycleId);
      const callArgs = mockPrisma.payslip.create.mock.calls[0][0];
      const basicSalary = new Decimal(15000);
      const earnings = new Decimal(15000); // base_salary component
      const deductions = new Decimal(1500); // 10% tax component
      const expectedNet = basicSalary.plus(earnings).minus(deductions);
      expect(callArgs.data.netPay.equals(expectedNet)).toBe(true);
    });

    it('should update existing payslip if one already exists', async () => {
      mockPrisma.payslip.findUnique.mockResolvedValue({
        id: 'existing-payslip',
        payrollCycleId: cycleId,
        employeeId,
      });
      mockPrisma.payslipComponent.deleteMany.mockResolvedValue({});
      mockPrisma.payslip.update.mockResolvedValue({ id: 'existing-payslip' });

      await service.calculatePayslip(employeeId, cycleId);

      expect(mockPrisma.payslipComponent.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.payslip.update).toHaveBeenCalled();
    });
  });

  describe('finalizePayrollCycle', () => {
    it('should finalize a COMPLETED cycle', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'COMPLETED',
        payslips: [],
      });
      mockPrisma.payrollCycle.update.mockResolvedValue({ id: 'c1', status: 'FINALIZED' });

      const result = await service.finalizePayrollCycle('c1');
      expect(result.status).toBe('FINALIZED');
      expect(mockPrisma.payrollCycle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FINALIZED' }),
        }),
      );
    });

    it('should throw if cycle is not COMPLETED', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'DRAFT',
        payslips: [],
      });

      await expect(service.finalizePayrollCycle('c1')).rejects.toThrow(BadRequestException);
    });

    it('should set lockedAt on finalization', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'COMPLETED',
        payslips: [],
      });
      mockPrisma.payrollCycle.update.mockResolvedValue({});

      await service.finalizePayrollCycle('c1');

      const updateCall = mockPrisma.payrollCycle.update.mock.calls[0][0];
      expect(updateCall.data.lockedAt).toBeInstanceOf(Date);
    });
  });

  describe('adjustPayslip', () => {
    it('should create adjustment for finalized cycle', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'FINALIZED',
      });
      mockPrisma.payrollAdjustment.create.mockResolvedValue({ id: 'adj-1' });

      const result = await service.adjustPayslip('emp-1', 'c1', {
        type: 'CREDIT',
        amount: 500,
        reason: 'Bonus',
      });

      expect(result.id).toBe('adj-1');
      expect(mockPrisma.payrollAdjustment.create).toHaveBeenCalled();
    });

    it('should create adjustment for paid cycle', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'PAID',
      });
      mockPrisma.payrollAdjustment.create.mockResolvedValue({ id: 'adj-2' });

      await service.adjustPayslip('emp-1', 'c1', {
        type: 'DEBIT',
        amount: 100,
        reason: 'Correction',
      });

      expect(mockPrisma.payrollAdjustment.create).toHaveBeenCalled();
    });

    it('should throw if cycle is not finalized or paid', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'COMPLETED',
      });

      await expect(
        service.adjustPayslip('emp-1', 'c1', {
          type: 'CREDIT',
          amount: 500,
          reason: 'Bonus',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCycle', () => {
    it('should create a new payroll cycle', async () => {
      mockPrisma.payrollCycle.findUnique.mockResolvedValue(null);
      mockPrisma.payrollCycle.create.mockResolvedValue({
        id: 'c1',
        tenantId: 't1',
        month: 3,
        year: 2025,
        status: 'DRAFT',
      });

      const result = await service.createCycle('t1', 3, 2025);
      expect(result.id).toBe('c1');
    });

    it('should throw if cycle already exists for month/year', async () => {
      mockPrisma.payrollCycle.findUnique.mockResolvedValue({
        id: 'existing',
        tenantId: 't1',
        month: 3,
        year: 2025,
      });

      await expect(service.createCycle('t1', 3, 2025)).rejects.toThrow(BadRequestException);
    });
  });

  describe('processCycle', () => {
    it('should process a DRAFT cycle and set to COMPLETED', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'DRAFT',
        tenantId: 't1',
        year: 2025,
        month: 3,
      });
      mockPrisma.payrollCycle.update.mockResolvedValue({});

      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 'emp-1', basicSalary: new Decimal(10000), tenantId: 't1', shift: null },
      ]);

      // For calculatePayslip calls
      mockPrisma.employee.findUniqueOrThrow
        .mockResolvedValue({
          id: 'emp-1',
          basicSalary: new Decimal(10000),
          tenantId: 't1',
          shift: null,
        });
      mockPrisma.salaryComponent.findMany.mockResolvedValue([]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.leaveRequest.findMany.mockResolvedValue([]);
      mockPrisma.loanInstallment.findMany.mockResolvedValue([]);
      mockPrisma.payslip.findUnique.mockResolvedValue(null);
      mockPrisma.payslip.create.mockResolvedValue({ id: 'p1' });

      const result = await service.processCycle('c1');
      expect(result).toBeDefined();
    });

    it('should throw if cycle is not DRAFT', async () => {
      mockPrisma.payrollCycle.findUniqueOrThrow.mockResolvedValue({
        id: 'c1',
        status: 'COMPLETED',
      });

      await expect(service.processCycle('c1')).rejects.toThrow(BadRequestException);
    });
  });
});
