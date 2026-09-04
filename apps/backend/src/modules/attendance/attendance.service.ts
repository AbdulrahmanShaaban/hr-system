import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(employeeId: string, notes?: string) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
      include: { shift: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing?.clockIn) {
      throw new BadRequestException('Already clocked in today');
    }

    const now = new Date();
    let status: 'PRESENT' | 'LATE' = 'PRESENT';
    let minutesLate = 0;

    if (employee.shift) {
      const [shiftHour, shiftMin] = employee.shift.startTime.split(':').map(Number);
      const shiftStart = new Date(today);
      shiftStart.setHours(shiftHour, shiftMin, 0, 0);

      const graceEnd = new Date(
        shiftStart.getTime() + employee.shift.gracePeriodMinutes * 60000,
      );

      if (now > graceEnd) {
        status = 'LATE';
        minutesLate = Math.floor((now.getTime() - shiftStart.getTime()) / 60000);
      }
    }

    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: { clockIn: now, status, minutesLate, notes },
      });
    }

    return this.prisma.attendance.create({
      data: {
        tenantId: employee.tenantId,
        employeeId,
        date: today,
        clockIn: now,
        status,
        minutesLate,
        notes,
      },
    });
  }

  async clockOut(employeeId: string, notes?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
      include: { employee: { include: { shift: true } } },
    });

    if (!attendance?.clockIn) {
      throw new BadRequestException('No clock-in found for today');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Already clocked out today');
    }

    const now = new Date();
    let overtimeMinutes = 0;

    if (attendance.employee.shift) {
      const [endHour, endMin] = attendance.employee.shift.endTime.split(':').map(Number);
      const shiftEnd = new Date(today);
      shiftEnd.setHours(endHour, endMin, 0, 0);

      if (now > shiftEnd) {
        overtimeMinutes = Math.floor((now.getTime() - shiftEnd.getTime()) / 60000);
      }
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut: now, overtimeMinutes, notes: notes ?? attendance.notes },
    });
  }

  async getAttendance(employeeId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.attendance.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }
}
