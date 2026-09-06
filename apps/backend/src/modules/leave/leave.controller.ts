import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { RequestLeaveDto } from './dto/leave.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async requestLeave(@CurrentUser('employeeId') employeeId: string, @Body() dto: RequestLeaveDto) {
    return this.leaveService.requestLeave(
      employeeId,
      dto.leaveTypeId,
      dto.startDate,
      dto.endDate,
      dto.reason,
    );
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.leaveService.findAll(tenantId, query);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get('types')
  async findAllTypes(@CurrentTenant() tenantId: string) {
    return this.leaveService.findAllLeaveTypes(tenantId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveLeave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.leaveService.approveLeave(id, userId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectLeave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.leaveService.rejectLeave(id, userId);
  }
}
