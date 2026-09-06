import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const where: Prisma.RoleWhereInput = { tenantId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { permissions: { include: { permission: true } }, _count: { select: { employees: true } } },
      }),
      this.prisma.role.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } }, employees: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({ data });
  }

  async update(id: string, data: Prisma.RoleUpdateInput) {
    await this.findOne(id);
    return this.prisma.role.update({ where: { id }, data });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId);
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
    return this.findOne(roleId);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  async findRoleUsers(roleId: string) {
    await this.findOne(roleId);
    const employees = await this.prisma.employee.findMany({
      where: { roleId },
      include: {
        user: { select: { id: true, email: true } },
        department: { select: { name: true } },
        role: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((emp) => ({
      id: emp.user?.id ?? emp.id,
      email: emp.user?.email ?? '',
      fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      employeeCode: emp.employeeCode,
      department: emp.department?.name ?? null,
      photoUrl: emp.avatar ?? null,
      assignedAt: emp.createdAt.toISOString(),
      roleName: emp.role?.name ?? null,
    }));
  }

  async findAllUsers(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, userId: { not: null } },
      include: {
        user: { select: { id: true, email: true } },
        role: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    });

    return employees.map((emp) => ({
      id: emp.user?.id ?? emp.id,
      email: emp.user?.email ?? '',
      fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      roleName: emp.role?.name ?? null,
    }));
  }

  async unassignUsers(roleId: string, userIds: string[]) {
    await this.findOne(roleId);
    await this.prisma.employee.updateMany({
      where: { roleId, userId: { in: userIds } },
      data: { roleId: null },
    });
    return { success: true };
  }
}
