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
}
