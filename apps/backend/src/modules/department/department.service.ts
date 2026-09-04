import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const where: Prisma.DepartmentWhereInput = { tenantId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { parent: true, children: true, _count: { select: { employees: true } } },
      }),
      this.prisma.department.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { parent: true, children: true, employees: true },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(data: Prisma.DepartmentCreateInput) {
    return this.prisma.department.create({ data });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    await this.findOne(id);
    return this.prisma.department.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
