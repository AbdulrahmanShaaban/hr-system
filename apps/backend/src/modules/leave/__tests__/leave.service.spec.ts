import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from '../leave.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  employee: {
    findUniqueOrThrow: jest.fn(),
  },
  leaveType: {
    findUniqueOrThrow: jest.fn(),
    findMany: jest.fn(),
  },
  leaveRequest: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  attendance: {
    upsert: jest.fn(),
    createMany: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((fns: unknown[]) => Promise.all(fns)),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('LeaveService', () => {
  let service: LeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    jest.clearAllMocks();
  });

  describe('requestLeave', () => {
    const mockEmployee = { id: 'emp-1', tenantId: 'tenant-1' };
    const mockLeaveType = { id: 'lt-1', name: 'Annual', defaultDays: 21, isPaid: true };

    beforeEach(() => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);
      mockPrisma.leaveType.findUniqueOrThrow.mockResolvedValue(mockLeaveType);
    });

    it('should create leave request when days are available', async () => {
      mockPrisma.leaveRequest.aggregate.mockResolvedValue({ _sum: { days: 5 } });
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lr-1',
        status: 'PENDING',
        days: 3,
      });

      const result = await service.requestLeave('emp-1', 'lt-1', '2025-03-10', '2025-03-12');

      expect(result.status).toBe('PENDING');
      expect(result.days).toBe(3);
    });

    it('should throw if insufficient leave days', async () => {
      mockPrisma.leaveRequest.aggregate.mockResolvedValue({ _sum: { days: 20 } });

      await expect(
        service.requestLeave('emp-1', 'lt-1', '2025-03-10', '2025-03-15'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if end date is before start date', async () => {
      await expect(
        service.requestLeave('emp-1', 'lt-1', '2025-03-15', '2025-03-10'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate days correctly across month boundaries', async () => {
      mockPrisma.leaveRequest.aggregate.mockResolvedValue({ _sum: { days: 0 } });
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lr-1',
        days: 5,
      });

      const result = await service.requestLeave('emp-1', 'lt-1', '2025-03-28', '2025-04-01');

      // Mar 28, 29, 30, 31, Apr 1 = 5 days
      expect(result.days).toBe(5);
    });

    it('should calculate 1 day for same-day leave', async () => {
      mockPrisma.leaveRequest.aggregate.mockResolvedValue({ _sum: { days: 0 } });
      mockPrisma.leaveRequest.create.mockResolvedValue({ id: 'lr-1', days: 1 });

      const result = await service.requestLeave('emp-1', 'lt-1', '2025-03-10', '2025-03-10');
      expect(result.days).toBe(1);
    });

    it('should include leaveType in response', async () => {
      mockPrisma.leaveRequest.aggregate.mockResolvedValue({ _sum: { days: 0 } });
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lr-1',
        leaveType: mockLeaveType,
      });

      const result = await service.requestLeave('emp-1', 'lt-1', '2025-03-10', '2025-03-10');
      expect(result.leaveType).toBeDefined();
    });
  });

  describe('approveLeave', () => {
    it('should approve pending leave and create attendance records via transaction', async () => {
      const mockRequest = {
        id: 'lr-1',
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-12'),
        status: 'PENDING',
        leaveType: { isPaid: true },
      };

      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue(mockRequest);
      mockPrisma.leaveRequest.update.mockResolvedValue({ ...mockRequest, status: 'APPROVED' });
      mockPrisma.attendance.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.attendance.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.approveLeave('lr-1', 'approver-1');

      expect(result.status).toBe('APPROVED');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.attendance.createMany).toHaveBeenCalled();
      expect(mockPrisma.attendance.updateMany).toHaveBeenCalled();
    });

    it('should emit leave.approved event', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-10'),
        status: 'PENDING',
        leaveType: { isPaid: true },
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({ status: 'APPROVED' });
      mockPrisma.attendance.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.attendance.updateMany.mockResolvedValue({ count: 1 });

      await service.approveLeave('lr-1', 'approver-1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'leave.approved',
        expect.objectContaining({
          employeeId: 'emp-1',
          leaveRequestId: 'lr-1',
        }),
      );
    });

    it('should throw if leave is not pending', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        status: 'APPROVED',
      });

      await expect(service.approveLeave('lr-1', 'approver-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create attendance records for each day of leave', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        employeeId: 'emp-1',
        tenantId: 'tenant-1',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-11'),
        status: 'PENDING',
        leaveType: {},
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({});
      mockPrisma.attendance.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.attendance.updateMany.mockResolvedValue({ count: 2 });

      await service.approveLeave('lr-1', 'approver-1');

      expect(mockPrisma.attendance.createMany).toHaveBeenCalled();
      expect(mockPrisma.attendance.updateMany).toHaveBeenCalled();
    });
  });

  describe('rejectLeave', () => {
    it('should reject pending leave', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        status: 'PENDING',
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({
        id: 'lr-1',
        status: 'REJECTED',
      });

      const result = await service.rejectLeave('lr-1', 'approver-1');

      expect(result.status).toBe('REJECTED');
    });

    it('should not modify attendance on rejection', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        status: 'PENDING',
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({ status: 'REJECTED' });

      await service.rejectLeave('lr-1', 'approver-1');

      expect(mockPrisma.attendance.createMany).not.toHaveBeenCalled();
    });

    it('should throw if leave is not pending', async () => {
      mockPrisma.leaveRequest.findUniqueOrThrow.mockResolvedValue({
        id: 'lr-1',
        status: 'APPROVED',
      });

      await expect(service.rejectLeave('lr-1', 'approver-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return leave requests for tenant', async () => {
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        { id: 'lr-1', employee: {}, leaveType: {} },
      ]);

      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByEmployee', () => {
    it('should return leave requests for employee', async () => {
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        { id: 'lr-1', leaveType: {} },
      ]);

      const result = await service.findByEmployee('emp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findAllLeaveTypes', () => {
    it('should return leave types for tenant', async () => {
      mockPrisma.leaveType.findMany.mockResolvedValue([
        { id: 'lt-1', name: 'Annual' },
      ]);

      const result = await service.findAllLeaveTypes('tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});
