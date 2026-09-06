import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from '../employee.controller';
import { EmployeeService } from '../employee.service';
import { LeaveService } from '../../leave/leave.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockEmployeeService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockLeaveService = {
  findByEmployee: jest.fn(),
};

const mockPrisma = {
  employee: {
    update: jest.fn(),
  },
  payslip: {
    findMany: jest.fn(),
  },
};

describe('EmployeeController', () => {
  let controller: EmployeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: LeaveService, useValue: mockLeaveService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-1';

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      mockEmployeeService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(tenantId, {});

      expect(result).toEqual(expected);
      expect(mockEmployeeService.findAll).toHaveBeenCalledWith(tenantId, {});
    });

    it('should forward search and pagination params', async () => {
      mockEmployeeService.findAll.mockResolvedValue({ data: [], total: 0 });
      const query = { search: 'ahmed', page: 2, limit: 10 };

      await controller.findAll(tenantId, query);

      expect(mockEmployeeService.findAll).toHaveBeenCalledWith(tenantId, query);
    });
  });

  describe('findOne', () => {
    it('should return a single employee', async () => {
      const emp = { id: 'emp-1', name: 'Ahmed Ali' };
      mockEmployeeService.findOne.mockResolvedValue(emp);

      const result = await controller.findOne(tenantId, 'emp-1');

      expect(result).toEqual(emp);
      expect(mockEmployeeService.findOne).toHaveBeenCalledWith('emp-1', tenantId);
    });

    it('should propagate NotFoundException for invalid ID', async () => {
      mockEmployeeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(tenantId, 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findLeaves', () => {
    it('should return mapped leaves for an employee', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1' });
      mockLeaveService.findByEmployee.mockResolvedValue([
        {
          id: 'leave-1',
          leaveType: { name: 'Annual' },
          startDate: '2024-03-01',
          endDate: '2024-03-03',
          days: 3,
          status: 'APPROVED',
          reason: 'Vacation',
        },
      ]);

      const result = await controller.findLeaves(tenantId, 'emp-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'leave-1',
        type: 'Annual',
        fromDate: '2024-03-01',
        toDate: '2024-03-03',
        days: 3,
        status: 'APPROVED',
        reason: 'Vacation',
      });
      expect(mockEmployeeService.findOne).toHaveBeenCalledWith('emp-1', tenantId);
    });

    it('should default leave type name to fallback text', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1' });
      mockLeaveService.findByEmployee.mockResolvedValue([
        {
          id: 'leave-2',
          leaveType: null,
          startDate: '2024-04-01',
          endDate: '2024-04-01',
          days: 1,
          status: 'PENDING',
          reason: null,
        },
      ]);

      const result = await controller.findLeaves(tenantId, 'emp-1');

      expect(result[0].type).toBe('إجازة');
    });

    it('should verify employee exists before fetching leaves', async () => {
      mockEmployeeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findLeaves(tenantId, 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLeaveService.findByEmployee).not.toHaveBeenCalled();
    });
  });

  describe('findPayrollSlips', () => {
    it('should return mapped payroll slips', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1' });
      mockPrisma.payslip.findMany.mockResolvedValue([
        {
          id: 'slip-1',
          basicSalary: 10000,
          totalEarnings: 13000,
          totalDeductions: 2000,
          netPay: 11000,
          payrollCycle: {
            month: 'MARCH',
            year: 2024,
            status: 'PAID',
            paidAt: new Date('2024-04-05'),
          },
        },
      ]);

      const result = await controller.findPayrollSlips(tenantId, 'emp-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'slip-1',
        month: 'MARCH',
        year: 2024,
        cycleStatus: 'PAID',
        basicSalary: 10000,
        totalAllowances: 3000,
        overtimeBonus: 0,
        totalDeductions: 2000,
        gross: 13000,
        netSalary: 11000,
        paidAt: expect.any(String),
      });
    });

    it('should handle null paidAt gracefully', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1' });
      mockPrisma.payslip.findMany.mockResolvedValue([
        {
          id: 'slip-2',
          basicSalary: 10000,
          totalEarnings: 10000,
          totalDeductions: 0,
          netPay: 10000,
          payrollCycle: {
            month: 'APRIL',
            year: 2024,
            status: 'PENDING',
            paidAt: null,
          },
        },
      ]);

      const result = await controller.findPayrollSlips(tenantId, 'emp-1');

      expect(result[0].paidAt).toBe('');
    });

    it('should verify employee exists before fetching slips', async () => {
      mockEmployeeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.findPayrollSlips(tenantId, 'bad-id'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.payslip.findMany).not.toHaveBeenCalled();
    });

    it('should order slips by year desc then month desc', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1' });
      mockPrisma.payslip.findMany.mockResolvedValue([]);

      await controller.findPayrollSlips(tenantId, 'emp-1');

      expect(mockPrisma.payslip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ payrollCycle: { year: 'desc' } }, { payrollCycle: { month: 'desc' } }],
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an employee with valid DTO', async () => {
      const dto = {
        employeeCode: 'EMP010',
        firstName: 'Sara',
        lastName: 'Ali',
        hireDate: '2024-06-01',
        basicSalary: 12000,
      };
      const created = { id: 'emp-10', ...dto };
      mockEmployeeService.create.mockResolvedValue(created);

      const result = await controller.create(tenantId, dto as any);

      expect(result).toEqual(created);
      expect(mockEmployeeService.create).toHaveBeenCalledWith(tenantId, dto);
    });
  });

  describe('update / patch', () => {
    it('should update employee via PUT', async () => {
      const body = { firstName: 'Updated', basicSalary: 15000 };
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1', ...body });

      const result = await controller.update(tenantId, 'emp-1', body as any);

      expect(result.firstName).toBe('Updated');
      expect(mockPrisma.employee.update).toHaveBeenCalled();
    });

    it('should update employee via PATCH', async () => {
      const body = { status: 'ON_LEAVE' };
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1', status: 'ON_LEAVE' });

      const result = await controller.patch(tenantId, 'emp-1', body as any);

      expect(mockPrisma.employee.update).toHaveBeenCalled();
    });

    it('should convert departmentId to connect syntax', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { departmentId: 'dept-2' } as any);

      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            department: { connect: { id: 'dept-2' } },
          }),
        }),
      );
    });

    it('should convert roleId to connect syntax', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { roleId: 'role-2' } as any);

      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: { connect: { id: 'role-2' } },
          }),
        }),
      );
    });

    it('should convert shiftId to connect syntax', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { shiftId: 'shift-2' } as any);

      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shift: { connect: { id: 'shift-2' } },
          }),
        }),
      );
    });

    it('should convert hireDate string to Date object', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { hireDate: '2024-09-01' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.hireDate).toBeInstanceOf(Date);
    });

    it('should convert terminationDate string to Date object', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { terminationDate: '2025-01-01' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.terminationDate).toBeInstanceOf(Date);
    });

    it('should accept ACTIVE status from allowlist', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { status: 'ACTIVE' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBe('ACTIVE');
    });

    it('should accept TERMINATED status from allowlist', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { status: 'TERMINATED' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBe('TERMINATED');
    });

    it('should accept SUSPENDED status from allowlist', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { status: 'SUSPENDED' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBe('SUSPENDED');
    });

    it('should reject invalid status values (not in allowlist)', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { status: 'INVALID_STATUS' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBeUndefined();
    });

    it('should map isActive=true to ACTIVE status', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { isActive: true } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBe('ACTIVE');
    });

    it('should map isActive=false to INACTIVE status', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { isActive: false } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData.status).toBe('INACTIVE');
    });

    it('should ignore unknown fields in body', async () => {
      mockEmployeeService.findOne.mockResolvedValue({ id: 'emp-1', tenantId });
      mockPrisma.employee.update.mockResolvedValue({ id: 'emp-1' });

      await controller.update(tenantId, 'emp-1', { hackerField: 'pwned' } as any);

      const callData = mockPrisma.employee.update.mock.calls[0][0].data;
      expect(callData).not.toHaveProperty('hackerField');
    });

    it('should verify employee exists before updating (IDOR prevention)', async () => {
      mockEmployeeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(tenantId, 'emp-999', { firstName: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.employee.update).not.toHaveBeenCalled();
    });

    it('should verify tenant match before updating (IDOR prevention)', async () => {
      mockEmployeeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('wrong-tenant', 'emp-1', { firstName: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.employee.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      mockEmployeeService.remove.mockResolvedValue({ id: 'emp-1' });

      const result = await controller.remove(tenantId, 'emp-1');

      expect(result.id).toBe('emp-1');
      expect(mockEmployeeService.remove).toHaveBeenCalledWith('emp-1', tenantId);
    });

    it('should propagate NotFoundException for invalid ID', async () => {
      mockEmployeeService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(tenantId, 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate NotFoundException for wrong tenant', async () => {
      mockEmployeeService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('wrong-tenant', 'emp-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
