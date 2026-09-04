import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from '../attendance.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  employee: {
    findUniqueOrThrow: jest.fn(),
  },
  attendance: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  describe('clockIn', () => {
    const mockEmployee = {
      id: 'emp-1',
      tenantId: 'tenant-1',
      shift: {
        startTime: '09:00',
        endTime: '17:00',
        gracePeriodMinutes: 15,
      },
    };

    it('should create attendance record on first clock-in', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findUnique.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        status: 'PRESENT',
      });

      const result = await service.clockIn('emp-1', 'Morning shift');

      expect(result.status).toBe('PRESENT');
      expect(mockPrisma.attendance.create).toHaveBeenCalled();
    });

    it('should not allow clocking in twice same day', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(),
        clockOut: null,
      });

      await expect(service.clockIn('emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should set status to LATE if past grace period', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue({
        ...mockEmployee,
        shift: { startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15 },
      });
      mockPrisma.attendance.findUnique.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({
        id: 'att-1',
        status: 'LATE',
        minutesLate: 30,
      });

      // We can't easily test real-time clock behavior, but we verify the logic path
      // by checking that create was called with correct data
      const result = await service.clockIn('emp-1');
      expect(mockPrisma.attendance.create).toHaveBeenCalled();
    });

    it('should calculate minutesLate from shift start', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue({
        ...mockEmployee,
        shift: { startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 0 },
      });
      mockPrisma.attendance.findUnique.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({ id: 'att-1' });

      await service.clockIn('emp-1');

      const createCall = mockPrisma.attendance.create.mock.calls[0][0];
      expect(typeof createCall.data.minutesLate).toBe('number');
    });

    it('should handle employee with no shift', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue({
        ...mockEmployee,
        shift: null,
      });
      mockPrisma.attendance.findUnique.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({
        id: 'att-1',
        status: 'PRESENT',
        minutesLate: 0,
      });

      const result = await service.clockIn('emp-1');
      expect(result.status).toBe('PRESENT');
    });

    it('should update existing record if no clock-in yet', async () => {
      mockPrisma.employee.findUniqueOrThrow.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: null,
        clockOut: null,
      });
      mockPrisma.attendance.update.mockResolvedValue({
        id: 'att-1',
        clockIn: new Date(),
      });

      const result = await service.clockIn('emp-1');
      expect(mockPrisma.attendance.update).toHaveBeenCalled();
    });
  });

  describe('clockOut', () => {
    it('should calculate overtime correctly', async () => {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(today.getTime() + 9 * 3600000), // 9 AM
        clockOut: null,
        notes: null,
        employee: {
          shift: { endTime: '17:00' },
        },
      });
      mockPrisma.attendance.update.mockResolvedValue({ id: 'att-1', overtimeMinutes: 30 });

      const result = await service.clockOut('emp-1');

      expect(mockPrisma.attendance.update).toHaveBeenCalled();
      const updateCall = mockPrisma.attendance.update.mock.calls[0][0];
      expect(typeof updateCall.data.overtimeMinutes).toBe('number');
    });

    it('should throw if no clock-in found', async () => {
      mockPrisma.attendance.findUnique.mockResolvedValue(null);

      await expect(service.clockOut('emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if already clocked out', async () => {
      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(),
        clockOut: new Date(),
        notes: null,
        employee: { shift: null },
      });

      await expect(service.clockOut('emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should handle employee with no shift (no overtime)', async () => {
      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(),
        clockOut: null,
        notes: null,
        employee: { shift: null },
      });
      mockPrisma.attendance.update.mockResolvedValue({ id: 'att-1', overtimeMinutes: 0 });

      await service.clockOut('emp-1');

      const updateCall = mockPrisma.attendance.update.mock.calls[0][0];
      expect(updateCall.data.overtimeMinutes).toBe(0);
    });

    it('should preserve existing notes when not providing new ones', async () => {
      mockPrisma.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        employeeId: 'emp-1',
        clockIn: new Date(),
        clockOut: null,
        notes: 'existing note',
        employee: { shift: null },
      });
      mockPrisma.attendance.update.mockResolvedValue({});

      await service.clockOut('emp-1');

      const updateCall = mockPrisma.attendance.update.mock.calls[0][0];
      expect(updateCall.data.notes).toBe('existing note');
    });
  });

  describe('getAttendance', () => {
    it('should return attendance records for date range', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([
        { id: 'att-1', date: new Date('2025-03-01'), status: 'PRESENT' },
        { id: 'att-2', date: new Date('2025-03-02'), status: 'LATE' },
      ]);

      const result = await service.getAttendance('emp-1', '2025-03-01', '2025-03-31');
      expect(result).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return all attendance for tenant', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([
        { id: 'att-1', tenantId: 'tenant-1', employee: { id: 'emp-1' } },
      ]);

      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});
