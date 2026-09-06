import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../employee.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

const mockPrisma = {
  employee: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const tenantId = 'tenant-1';

    it('should return paginated employees for a tenant', async () => {
      const employees = [{ id: 'emp-1', firstName: 'Ahmed', lastName: 'Ali' }];
      mockPrisma.employee.findMany.mockResolvedValue(employees);
      mockPrisma.employee.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, {});

      expect(result.data).toEqual(employees);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should apply search filter across firstName, lastName, employeeCode', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await service.findAll(tenantId, { search: 'ahmed' });

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId,
            OR: [
              { firstName: { contains: 'ahmed', mode: 'insensitive' } },
              { lastName: { contains: 'ahmed', mode: 'insensitive' } },
              { employeeCode: { contains: 'ahmed', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should apply pagination with custom page and limit', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(50);

      const result = await service.findAll(tenantId, { page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should apply custom sorting', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await service.findAll(tenantId, { sortBy: 'firstName', sortOrder: 'asc' });

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { firstName: 'asc' },
        }),
      );
    });

    it('should include department, role, and shift relations', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await service.findAll(tenantId, {});

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { department: true, role: true, shift: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    const baseEmployee = {
      id: 'emp-1',
      firstName: 'Ahmed',
      lastName: 'Ali',
      employeeCode: 'EMP001',
      phone: '+966500000000',
      avatar: null,
      departmentId: 'dept-1',
      position: 'Developer',
      basicSalary: 10000,
      status: 'ACTIVE',
      hireDate: new Date('2024-01-01'),
      terminationDate: null,
      shiftId: 'shift-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tenantId: 'tenant-1',
      department: { id: 'dept-1', name: 'Engineering' },
      role: { id: 'role-1', name: 'PERMANENT' },
      shift: { id: 'shift-1', name: 'Morning', startTime: '08:00', endTime: '17:00' },
      user: { email: 'ahmed@example.com' },
    };

    it('should return formatted employee data', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);

      const result = await service.findOne('emp-1', 'tenant-1');

      expect(result.id).toBe('emp-1');
      expect(result.name).toBe('Ahmed Ali');
      expect(result.email).toBe('ahmed@example.com');
      expect(result.isActive).toBe(true);
      expect(result.accountStatus).toBe('ACTIVE');
      expect(result.department).toBe('Engineering');
      expect(result.employmentType).toBe('PERMANENT');
    });

    it('should throw NotFoundException for non-existent employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when employee belongs to different tenant', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);

      await expect(service.findOne('emp-1', 'wrong-tenant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not check tenant when tenantId is omitted', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);

      const result = await service.findOne('emp-1');

      expect(result.id).toBe('emp-1');
    });

    it('should return ON_LEAVE status correctly', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        ...baseEmployee,
        status: 'ON_LEAVE',
      });

      const result = await service.findOne('emp-1', 'tenant-1');

      expect(result.accountStatus).toBe('ON_LEAVE');
      expect(result.onLeave).toBe(true);
      expect(result.isActive).toBe(false);
    });

    it('should return INACTIVE status for non-active, non-leave employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        ...baseEmployee,
        status: 'TERMINATED',
      });

      const result = await service.findOne('emp-1', 'tenant-1');

      expect(result.accountStatus).toBe('INACTIVE');
      expect(result.isActive).toBe(false);
    });
  });

  describe('create', () => {
    const tenantId = 'tenant-1';
    const dto: CreateEmployeeDto = {
      employeeCode: 'EMP002',
      firstName: 'Sara',
      lastName: 'Mohamed',
      phone: '+966511111111',
      hireDate: '2024-06-01',
      basicSalary: 12000,
      status: 'ACTIVE',
      position: 'Designer',
      departmentId: 'dept-1',
      roleId: 'role-1',
      shiftId: 'shift-1',
    };

    it('should create an employee with all fields', async () => {
      const created = { id: 'emp-2', ...dto, tenantId };
      mockPrisma.employee.create.mockResolvedValue(created);

      const result = await service.create(tenantId, dto);

      expect(result.id).toBe('emp-2');
      expect(mockPrisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeCode: 'EMP002',
            firstName: 'Sara',
            lastName: 'Mohamed',
            phone: '+966511111111',
            basicSalary: 12000,
            status: 'ACTIVE',
          }),
          include: { department: true, role: true, shift: true },
        }),
      );
    });

    it('should connect tenant correctly', async () => {
      mockPrisma.employee.create.mockResolvedValue({ id: 'emp-2' });

      await service.create(tenantId, dto);

      expect(mockPrisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenant: { connect: { id: tenantId } },
          }),
        }),
      );
    });

    it('should connect optional relations when provided', async () => {
      mockPrisma.employee.create.mockResolvedValue({ id: 'emp-2' });

      await service.create(tenantId, dto);

      const callData = mockPrisma.employee.create.mock.calls[0][0].data;
      expect(callData.department).toEqual({ connect: { id: 'dept-1' } });
      expect(callData.role).toEqual({ connect: { id: 'role-1' } });
      expect(callData.shift).toEqual({ connect: { id: 'shift-1' } });
    });

    it('should create employee without optional fields', async () => {
      const minimalDto: CreateEmployeeDto = {
        employeeCode: 'EMP003',
        firstName: 'Ali',
        lastName: 'Hassan',
        hireDate: '2024-07-01',
        basicSalary: 8000,
      };
      mockPrisma.employee.create.mockResolvedValue({ id: 'emp-3' });

      await service.create(tenantId, minimalDto);

      const callData = mockPrisma.employee.create.mock.calls[0][0].data;
      expect(callData.department).toBeUndefined();
      expect(callData.role).toBeUndefined();
      expect(callData.shift).toBeUndefined();
      expect(callData.user).toBeUndefined();
    });

    it('should connect user when userId is provided', async () => {
      const dtoWithUser = { ...dto, userId: 'user-1' };
      mockPrisma.employee.create.mockResolvedValue({ id: 'emp-2' });

      await service.create(tenantId, dtoWithUser);

      const callData = mockPrisma.employee.create.mock.calls[0][0].data;
      expect(callData.user).toEqual({ connect: { id: 'user-1' } });
    });

    it('should convert hireDate string to Date object', async () => {
      mockPrisma.employee.create.mockResolvedValue({ id: 'emp-2' });

      await service.create(tenantId, dto);

      const callData = mockPrisma.employee.create.mock.calls[0][0].data;
      expect(callData.hireDate).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    const baseEmployee = {
      id: 'emp-1',
      firstName: 'Ahmed',
      lastName: 'Ali',
      employeeCode: 'EMP001',
      phone: '+966500000000',
      avatar: null,
      departmentId: 'dept-1',
      position: 'Developer',
      basicSalary: 10000,
      status: 'ACTIVE',
      hireDate: new Date('2024-01-01'),
      terminationDate: null,
      shiftId: 'shift-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tenantId: 'tenant-1',
      department: { id: 'dept-1', name: 'Engineering' },
      role: { id: 'role-1', name: 'PERMANENT' },
      shift: { id: 'shift-1', name: 'Morning', startTime: '08:00', endTime: '17:00' },
      user: { email: 'ahmed@example.com' },
    };

    it('should update employee data after verifying existence', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);
      mockPrisma.employee.update.mockResolvedValue({ ...baseEmployee, firstName: 'Updated' });

      const result = await service.update('emp-1', { firstName: 'Updated' }, 'tenant-1');

      expect(result.firstName).toBe('Updated');
      expect(mockPrisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        data: { firstName: 'Updated' },
      });
    });

    it('should throw if employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { firstName: 'X' }, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const baseEmployee = {
      id: 'emp-1',
      firstName: 'Ahmed',
      lastName: 'Ali',
      employeeCode: 'EMP001',
      phone: '+966500000000',
      avatar: null,
      departmentId: 'dept-1',
      position: 'Developer',
      basicSalary: 10000,
      status: 'ACTIVE',
      hireDate: new Date('2024-01-01'),
      terminationDate: null,
      shiftId: 'shift-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tenantId: 'tenant-1',
      department: { id: 'dept-1', name: 'Engineering' },
      role: { id: 'role-1', name: 'PERMANENT' },
      shift: { id: 'shift-1', name: 'Morning', startTime: '08:00', endTime: '17:00' },
      user: { email: 'ahmed@example.com' },
    };

    it('should delete an existing employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);
      mockPrisma.employee.delete.mockResolvedValue({ id: 'emp-1' });

      const result = await service.remove('emp-1', 'tenant-1');

      expect(result.id).toBe('emp-1');
      expect(mockPrisma.employee.delete).toHaveBeenCalledWith({ where: { id: 'emp-1' } });
    });

    it('should throw if employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if employee belongs to different tenant', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(baseEmployee);

      await expect(service.remove('emp-1', 'wrong-tenant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
