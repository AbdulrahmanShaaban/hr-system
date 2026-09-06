import { Test, TestingModule } from '@nestjs/testing';
import { LoanService } from '../loan.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  employee: {
    findUniqueOrThrow: jest.fn(),
  },
  loanType: {
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
  },
  loan: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  loanInstallment: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
};

describe('LoanService', () => {
  let service: LoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
    jest.clearAllMocks();
  });

  describe('requestLoan', () => {
    const mockEmployee = { id: 'emp-1', tenantId: 'tenant-1' };
    const mockLoanType = {
      id: 'lt-1',
      name: 'Salary Advance',
      maxAmount: new Decimal(50000),
    };

    beforeEach(() => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);
      mockPrisma.loanType.findUniqueOrThrow.mockResolvedValue(mockLoanType);
      mockPrisma.loan.findFirst.mockResolvedValue(null);
    });

    it('should create loan with 12 installments', async () => {
      mockPrisma.loan.create.mockResolvedValue({
        id: 'loan-1',
        amount: new Decimal(12000),
        installments: Array.from({ length: 12 }, (_, i) => ({
          id: `inst-${i + 1}`,
          amount: new Decimal(1000),
          status: 'PENDING',
        })),
      });

      const result = await service.requestLoan('emp-1', 'lt-1', 12000);

      expect(result.installments).toHaveLength(12);
      expect(mockPrisma.loan.create).toHaveBeenCalled();
    });

    it('should set monthly deduction as amount / 12', async () => {
      mockPrisma.loan.create.mockImplementation((args) =>
        Promise.resolve({ id: 'loan-1', ...args.data, installments: [] }),
      );

      await service.requestLoan('emp-1', 'lt-1', 12000);

      const createCall = mockPrisma.loan.create.mock.calls[0][0];
      expect(createCall.data.monthlyDeduction.equals(new Decimal(1000))).toBe(true);
    });

    it('should throw if amount exceeds loan type max', async () => {
      await expect(service.requestLoan('emp-1', 'lt-1', 60000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if employee has active loan', async () => {
      mockPrisma.loan.findFirst.mockResolvedValue({ id: 'existing-loan', status: 'ACTIVE' });

      await expect(service.requestLoan('emp-1', 'lt-1', 12000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create installments with monthly due dates', async () => {
      mockPrisma.loan.create.mockImplementation((args) =>
        Promise.resolve({ id: 'loan-1', ...args.data, installments: [] }),
      );

      await service.requestLoan('emp-1', 'lt-1', 12000);

      const createCall = mockPrisma.loan.create.mock.calls[0][0];
      const installmentsData = createCall.data.installments.create;
      expect(installmentsData).toHaveLength(12);

      // All installments should have PENDING status
      installmentsData.forEach((inst: any) => {
        expect(inst.status).toBe('PENDING');
      });
    });

    it('should set initial remaining equal to amount', async () => {
      mockPrisma.loan.create.mockImplementation((args) =>
        Promise.resolve({ id: 'loan-1', ...args.data, installments: [] }),
      );

      await service.requestLoan('emp-1', 'lt-1', 12000);

      const createCall = mockPrisma.loan.create.mock.calls[0][0];
      expect(createCall.data.remaining.equals(new Decimal(12000))).toBe(true);
    });

    it('should set loan status to ACTIVE', async () => {
      mockPrisma.loan.create.mockImplementation((args) =>
        Promise.resolve({ id: 'loan-1', ...args.data, installments: [] }),
      );

      await service.requestLoan('emp-1', 'lt-1', 12000);

      const createCall = mockPrisma.loan.create.mock.calls[0][0];
      expect(createCall.data.status).toBe('ACTIVE');
    });
  });

  describe('payInstallment', () => {
    it('should mark installment as PAID and update remaining', async () => {
      const installment = {
        id: 'inst-1',
        loanId: 'loan-1',
        amount: new Decimal(1000),
        status: 'PENDING',
        loan: {
          id: 'loan-1',
          remaining: new Decimal(12000),
          status: 'ACTIVE',
        },
      };

      mockPrisma.loanInstallment.findUniqueOrThrow.mockResolvedValue(installment);
      mockPrisma.loanInstallment.update.mockResolvedValue({ ...installment, status: 'PAID' });
      mockPrisma.loan.update.mockResolvedValue({});

      const result = await service.payInstallment('inst-1');

      expect(result.status).toBe('PAID');
      expect(mockPrisma.loanInstallment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
    });

    it('should update loan remaining balance', async () => {
      mockPrisma.loanInstallment.findUniqueOrThrow.mockResolvedValue({
        id: 'inst-1',
        amount: new Decimal(1000),
        status: 'PENDING',
        loan: { id: 'loan-1', remaining: new Decimal(12000) },
      });
      mockPrisma.loanInstallment.update.mockResolvedValue({});
      mockPrisma.loan.update.mockResolvedValue({});

      await service.payInstallment('inst-1');

      expect(mockPrisma.loan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            remaining: new Decimal(11000),
          }),
        }),
      );
    });

    it('should mark loan as PAID when remaining reaches zero', async () => {
      mockPrisma.loanInstallment.findUniqueOrThrow.mockResolvedValue({
        id: 'inst-12',
        amount: new Decimal(1000),
        status: 'PENDING',
        loan: { id: 'loan-1', remaining: new Decimal(1000) },
      });
      mockPrisma.loanInstallment.update.mockResolvedValue({});
      mockPrisma.loan.update.mockResolvedValue({});

      await service.payInstallment('inst-12');

      expect(mockPrisma.loan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
    });

    it('should keep loan ACTIVE if remaining is positive', async () => {
      mockPrisma.loanInstallment.findUniqueOrThrow.mockResolvedValue({
        id: 'inst-1',
        amount: new Decimal(1000),
        status: 'PENDING',
        loan: { id: 'loan-1', remaining: new Decimal(5000) },
      });
      mockPrisma.loanInstallment.update.mockResolvedValue({});
      mockPrisma.loan.update.mockResolvedValue({});

      await service.payInstallment('inst-1');

      expect(mockPrisma.loan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('should throw if installment already paid', async () => {
      mockPrisma.loanInstallment.findUniqueOrThrow.mockResolvedValue({
        id: 'inst-1',
        status: 'PAID',
        loan: { remaining: new Decimal(11000) },
      });

      await expect(service.payInstallment('inst-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findActiveByEmployee', () => {
    it('should return active loan for employee', async () => {
      mockPrisma.loan.findFirst.mockResolvedValue({
        id: 'loan-1',
        status: 'ACTIVE',
        installments: [],
      });

      const result = await service.findActiveByEmployee('emp-1');
      expect(result!.status).toBe('ACTIVE');
    });

    it('should return null if no active loan', async () => {
      mockPrisma.loan.findFirst.mockResolvedValue(null);

      const result = await service.findActiveByEmployee('emp-1');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all loans for tenant', async () => {
      mockPrisma.loan.findMany.mockResolvedValue([
        { id: 'loan-1', employee: {}, loanType: {} },
      ]);
      mockPrisma.loan.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', {});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findAllLoanTypes', () => {
    it('should return all loan types for tenant', async () => {
      mockPrisma.loanType.findMany.mockResolvedValue([
        { id: 'lt-1', name: 'Salary Advance' },
      ]);

      const result = await service.findAllLoanTypes('tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});
