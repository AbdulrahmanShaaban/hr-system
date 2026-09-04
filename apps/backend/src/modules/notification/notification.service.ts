import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        title: dto.title,
        message: dto.message,
        type: (dto.type as any) ?? 'INFO',
      },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.notification.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnread(employeeId: string) {
    return this.prisma.notification.findMany({
      where: { employeeId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(employeeId: string) {
    return this.prisma.notification.updateMany({
      where: { employeeId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    return this.prisma.notification.delete({ where: { id } });
  }
}
