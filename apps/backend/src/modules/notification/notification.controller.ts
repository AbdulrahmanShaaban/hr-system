import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create('tenant-id-placeholder', dto);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.notificationService.findByEmployee(employeeId);
  }

  @Get('employee/:employeeId/unread')
  async findUnread(@Param('employeeId') employeeId: string) {
    return this.notificationService.findUnread(employeeId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('employee/:employeeId/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param('employeeId') employeeId: string) {
    return this.notificationService.markAllAsRead(employeeId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
