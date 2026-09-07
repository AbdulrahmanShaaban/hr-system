import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto } from './dto/attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  private resolveEmployeeId(jwtEmployeeId: string | undefined, bodyEmployeeId?: string): string {
    const effective = jwtEmployeeId ?? bodyEmployeeId;
    if (!effective) {
      throw new BadRequestException(
        'No employee linked to this account. Pass employeeId in the request body.',
      );
    }
    return effective;
  }

  @Post('clock-in')
  @HttpCode(HttpStatus.OK)
  async clockIn(
    @CurrentUser('employeeId') jwtEmployeeId: string | undefined,
    @Body() dto: ClockInDto,
  ) {
    const employeeId = this.resolveEmployeeId(jwtEmployeeId, dto.employeeId);
    return this.attendanceService.clockIn(employeeId, dto.notes);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(
    @CurrentUser('employeeId') jwtEmployeeId: string | undefined,
    @Body() dto: ClockOutDto,
  ) {
    const employeeId = this.resolveEmployeeId(jwtEmployeeId, dto.employeeId);
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
  async findAll(@CurrentTenant() tenantId: string, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(tenantId, query);
  }
}
