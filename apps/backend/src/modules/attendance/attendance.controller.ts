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
import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto, GetAttendanceDto } from './dto/attendance.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @HttpCode(HttpStatus.OK)
  async clockIn(@CurrentUser('employeeId') employeeId: string, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(employeeId, dto.notes);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(@CurrentUser('employeeId') employeeId: string, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(employeeId, dto.notes);
  }

  @Get('employee/:employeeId')
  async getAttendance(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getAttendance(employeeId, startDate, endDate);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.attendanceService.findAll(tenantId, query);
  }
}
