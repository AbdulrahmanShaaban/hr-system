import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { RequestLeaveDto } from './dto/leave.dto';

@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async requestLeave(@Body() dto: RequestLeaveDto) {
    return this.leaveService.requestLeave(
      'employee-id-placeholder',
      dto.leaveTypeId,
      dto.startDate,
      dto.endDate,
      dto.reason,
    );
  }

  @Get()
  async findAll() {
    return this.leaveService.findAll('tenant-id-placeholder');
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get('types')
  async findAllTypes() {
    return this.leaveService.findAllLeaveTypes('tenant-id-placeholder');
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveLeave(@Param('id') id: string) {
    return this.leaveService.approveLeave(id, 'approver-id-placeholder');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectLeave(@Param('id') id: string) {
    return this.leaveService.rejectLeave(id, 'approver-id-placeholder');
  }
}
