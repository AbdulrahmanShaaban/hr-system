import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async requestLeave(
    employeeId: string,
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    reason?: string,
  ) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
    });

    const leaveType = await this.prisma.leaveType.findUniqueOrThrow({
      where: { id: leaveTypeId },
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      throw new BadRequestException('End date must be after start date');
    }

    const diffTime = end.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const year = start.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const usedDays = await this.prisma.leaveRequest.aggregate({
      where: {
        employeeId,
        leaveTypeId,
        status: 'APPROVED',
        startDate: { gte: yearStart },
        endDate: { lte: yearEnd },
      },
      _sum: { days: true },
    });

    const totalUsed = usedDays._sum.days ?? 0;
    if (totalUsed + days > leaveType.defaultDays) {
      throw new BadRequestException(
        `Insufficient leave days. Available: ${leaveType.defaultDays - totalUsed}, Requested: ${days}`,
      );
    }

    return this.prisma.leaveRequest.create({
      data: {
        tenantId: employee.tenantId,
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'PENDING',
      },
      include: { leaveType: true },
    });
  }

  async approveLeave(requestId: string, approverId: string) {
    const request = await this.prisma.leaveRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: { leaveType: true },
    });

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Leave request is not pending');
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      const day = new Date(current);
      day.setHours(0, 0, 0, 0);
      dates.push(day);
      current.setDate(current.getDate() + 1);
    }

    const createData = dates.map((date) => ({
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      date,
      status: 'ON_LEAVE' as const,
    }));

    await this.prisma.$transaction([
      this.prisma.attendance.createMany({ data: createData, skipDuplicates: true }),
      this.prisma.attendance.updateMany({
        where: {
          employeeId: request.employeeId,
          date: { gte: start, lte: end },
        },
        data: { status: 'ON_LEAVE' },
      }),
    ]);

    this.eventEmitter.emit('leave.approved', {
      employeeId: request.employeeId,
      leaveRequestId: requestId,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    return updated;
  }

  async rejectLeave(requestId: string, approverId: string) {
    const request = await this.prisma.leaveRequest.findUniqueOrThrow({
      where: { id: requestId },
    });

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Leave request is not pending');
    }

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const where: Prisma.LeaveRequestWhereInput = { tenantId };
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { employee: true, leaveType: true },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllLeaveTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }
}
