import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

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

  async create(tenantId: string, dto: CreateDepartmentDto) {
    const data: Prisma.DepartmentCreateInput = {
      name: dto.name.trim(),
      tenant: { connect: { id: tenantId } },
    };
    if (dto.parentId) {
      data.parent = { connect: { id: dto.parentId } };
    }
    try {
      return await this.prisma.department.create({ data });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Department with this name already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    const data: Prisma.DepartmentUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.parentId !== undefined) {
      data.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
    }
    try {
      return await this.prisma.department.update({ where: { id }, data });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Department with this name already exists');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
