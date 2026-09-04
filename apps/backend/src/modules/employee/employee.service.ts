import { Injectable, NotFoundException } from '@nestjs/common';
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
        include: { department: true, role: true, shift: true },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, role: true, shift: true, user: true },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(tenantId: string, dto: CreateEmployeeDto) {
    const data: Prisma.EmployeeCreateInput = {
      tenant: { connect: { id: tenantId } },
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatar: dto.avatar,
      hireDate: new Date(dto.hireDate),
      terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
      status: dto.status as never,
      position: dto.position,
      basicSalary: dto.basicSalary,
    };
    if (dto.departmentId) data.department = { connect: { id: dto.departmentId } };
    if (dto.roleId) data.role = { connect: { id: dto.roleId } };
    if (dto.shiftId) data.shift = { connect: { id: dto.shiftId } };
    if (dto.userId) data.user = { connect: { id: dto.userId } };

    return this.prisma.employee.create({ data, include: { department: true, role: true, shift: true } });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput) {
    await this.findOne(id);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employee.delete({ where: { id } });
  }
}
