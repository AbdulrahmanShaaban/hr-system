import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateRequestDto, QueryRequestDto, ReviewRequestDto } from './dto/create-request.dto';
import { Prisma, UserRequest } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToRequestItem(request: UserRequest & { employee: { firstName: string; lastName: string } | null }) {
    return {
      id: request.id,
      type: request.type,
      title: request.title,
      reason: request.reason,
      date: request.date?.toISOString() ?? null,
      hours: request.hours != null ? Number(request.hours) : null,
      status: request.status,
      approvalLevel: request.approvalLevel,
      employeeName: request.employee
        ? `${request.employee.firstName} ${request.employee.lastName}`
        : null,
      employeeId: request.employeeId,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  async create(tenantId: string, employeeId: string, dto: CreateRequestDto) {
    const request = await this.prisma.userRequest.create({
      data: {
        tenantId,
        employeeId,
        type: dto.type,
        title: dto.title ?? null,
        reason: dto.reason ?? null,
        date: dto.date ? new Date(dto.date) : null,
        hours: dto.hours ?? null,
        status: 'PENDING',
        approvalLevel: 1,
      },
      include: { employee: true },
    });

    return this.mapToRequestItem(request);
  }

  async findAll(tenantId: string, currentEmployeeId: string, query: QueryRequestDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.UserRequestWhereInput = { tenantId };

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.mine === '1') {
      where.employeeId = currentEmployeeId;
    }

    const orderBy: Prisma.UserRequestOrderByWithRelationInput = {
      createdAt: query.order ?? 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.userRequest.findMany({
        where,
        include: { employee: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.userRequest.count({ where }),
    ]);

    return {
      data: data.map((r) => this.mapToRequestItem(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const request = await this.prisma.userRequest.findFirst({
      where: { id, tenantId },
      include: { employee: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return this.mapToRequestItem(request);
  }

  async approve(id: string, tenantId: string, reviewerUserId: string, dto: ReviewRequestDto) {
    const request = await this.prisma.userRequest.findFirst({
      where: { id, tenantId },
      include: { employee: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      throw new BadRequestException('Request cannot be approved in its current status');
    }

    const updated = await this.prisma.userRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewNote: dto.reviewNote ?? null,
        reviewedBy: reviewerUserId,
        reviewedAt: new Date(),
      },
      include: { employee: true },
    });

    return this.mapToRequestItem(updated);
  }

  async reject(id: string, tenantId: string, reviewerUserId: string, dto: ReviewRequestDto) {
    const request = await this.prisma.userRequest.findFirst({
      where: { id, tenantId },
      include: { employee: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      throw new BadRequestException('Request cannot be rejected in its current status');
    }

    const updated = await this.prisma.userRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNote: dto.reviewNote ?? null,
        reviewedBy: reviewerUserId,
        reviewedAt: new Date(),
      },
      include: { employee: true },
    });

    return this.mapToRequestItem(updated);
  }

  async cancel(id: string, tenantId: string, employeeId: string) {
    const request = await this.prisma.userRequest.findFirst({
      where: { id, tenantId },
      include: { employee: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      throw new BadRequestException('Request cannot be cancelled in its current status');
    }

    const updated = await this.prisma.userRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { employee: true },
    });

    return this.mapToRequestItem(updated);
  }
}
