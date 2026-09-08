import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const where: Prisma.EmployeeWhereInput = { tenantId };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { department: true, role: true, shift: true, user: { select: { email: true } } },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, tenantId?: string) {
    const where: Prisma.EmployeeWhereUniqueInput = { id };
    const emp = await this.prisma.employee.findUnique({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        phone: true,
        avatar: true,
        departmentId: true,
        position: true,
        basicSalary: true,
        status: true,
        hireDate: true,
        terminationDate: true,
        shiftId: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        department: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        user: { select: { email: true } },
      },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    if (tenantId && emp.tenantId !== tenantId) throw new NotFoundException('Employee not found');

    const isActive = emp.status === 'ACTIVE';
    const accountStatus =
      emp.status === 'ON_LEAVE' ? 'ON_LEAVE' : isActive ? 'ACTIVE' : 'INACTIVE';

    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`.trim(),
      employeeCode: emp.employeeCode,
      email: emp.user?.email ?? null,
      phone: emp.phone,
      photoUrl: emp.avatar,
      departmentId: emp.departmentId,
      department: emp.department?.name ?? null,
      position: emp.position,
      employmentType: emp.role?.name ?? 'PERMANENT',
      salaryBasis: 'MONTHLY',
      basicSalary: emp.basicSalary,
      isActive,
      isGosiRegistered: false,
      gosiNumber: null,
      managerId: null,
      managerName: null,
      jobRank: 'EMPLOYEE',
      workLocation: 'HEADQUARTERS',
      contractDurationYears: null,
      accountStatus,
      onLeave: emp.status === 'ON_LEAVE',
      createdAt: emp.createdAt.toISOString(),
      updatedAt: emp.updatedAt?.toISOString(),
      hireDate: emp.hireDate?.toISOString() ?? null,
      shiftId: emp.shiftId,
      shift: emp.shift,
    };
  }

  async create(tenantId: string, dto: CreateEmployeeDto) {
    // Resolve first/last name: DTO accepts either the pair or a single `name`.
    let firstName = dto.firstName?.trim();
    let lastName = dto.lastName?.trim();
    if ((!firstName || !lastName) && dto.name?.trim()) {
      const parts = dto.name.trim().split(/\s+/);
      firstName = firstName || parts[0];
      lastName = lastName || parts.slice(1).join(' ') || parts[0];
    }
    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName (or name) are required');
    }

    const hireDateRaw = dto.hireDate ?? dto.joinDate;
    if (!hireDateRaw) {
      throw new BadRequestException('hireDate is required');
    }
    if (dto.basicSalary === undefined || dto.basicSalary === null) {
      throw new BadRequestException('basicSalary is required');
    }

    // Auto-generate a unique-per-tenant code when the client doesn't send one
    // (the wizard relies on server-side assignment).
    const employeeCode =
      dto.employeeCode?.trim() ||
      `EMP-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296)
        .toString(36)
        .toUpperCase()
        .padStart(2, '0')}`;

    // Frontend "INACTIVE" alias has no Prisma enum member → map to SUSPENDED.
    const rawStatus = dto.status?.toUpperCase().replace('-', '_');
    const status = (
      !rawStatus ? 'ACTIVE' :
      rawStatus === 'INACTIVE' ? 'SUSPENDED' :
      rawStatus
    ) as 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';

    const data: Prisma.EmployeeCreateInput = {
      tenant: { connect: { id: tenantId } },
      employeeCode,
      firstName,
      lastName,
      phone: dto.phone,
      avatar: dto.avatar ?? dto.photoUrl,
      hireDate: new Date(hireDateRaw),
      terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
      status,
      position: dto.position,
      basicSalary: dto.basicSalary,
    };
    if (dto.departmentId) data.department = { connect: { id: dto.departmentId } };
    if (dto.roleId) data.role = { connect: { id: dto.roleId } };
    if (dto.shiftId) data.shift = { connect: { id: dto.shiftId } };
    if (dto.userId) data.user = { connect: { id: dto.userId } };

    return this.prisma.employee.create({ data, include: { department: true, role: true, shift: true } });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput, tenantId?: string) {
    await this.findOne(id, tenantId);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async remove(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);
    return this.prisma.employee.delete({ where: { id } });
  }
}
