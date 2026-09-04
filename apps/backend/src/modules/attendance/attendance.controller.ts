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

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @HttpCode(HttpStatus.OK)
  async clockIn(@Body() dto: ClockInDto) {
    return this.attendanceService.clockIn('employee-id-placeholder', dto.notes);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(@Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut('employee-id-placeholder', dto.notes);
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
  async findAll() {
    return this.attendanceService.findAll('tenant-id-placeholder');
  }
}
