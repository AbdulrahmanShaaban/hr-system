import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateShiftDto) {
    const existing = await this.prisma.shift.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (existing) {
      throw new BadRequestException('A shift with this name already exists');
    }

    return this.prisma.shift.create({
      data: {
        tenantId,
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        gracePeriodMinutes: dto.gracePeriodMinutes ?? 0,
      },
    });
  }

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const where: Prisma.ShiftWhereInput = { tenantId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    const [data, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.shift.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, dto: UpdateShiftDto) {
    await this.findOne(id);

    if (dto.name) {
      const shift = await this.prisma.shift.findUniqueOrThrow({ where: { id } });
      const nameTaken = await this.prisma.shift.findUnique({
        where: { tenantId_name: { tenantId: shift.tenantId, name: dto.name } },
      });
      if (nameTaken && nameTaken.id !== id) {
        throw new BadRequestException('A shift with this name already exists');
      }
    }

    return this.prisma.shift.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.gracePeriodMinutes !== undefined && {
          gracePeriodMinutes: dto.gracePeriodMinutes,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shift.delete({ where: { id } });
  }
}
