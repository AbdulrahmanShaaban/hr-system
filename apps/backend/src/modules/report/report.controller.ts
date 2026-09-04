import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';
import {
  GenerateAttendanceReportDto,
  GeneratePayrollReportDto,
} from './dto/report.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('attendance')
  @HttpCode(HttpStatus.CREATED)
  async generateAttendanceReport(@Body() dto: GenerateAttendanceReportDto) {
    return this.reportService.generateAttendanceReport(
      'tenant-id-placeholder',
      dto.startDate,
      dto.endDate,
    );
  }

  @Post('payroll')
  @HttpCode(HttpStatus.CREATED)
  async generatePayrollReport(@Body() dto: GeneratePayrollReportDto) {
    return this.reportService.generatePayrollReport(
      'tenant-id-placeholder',
      dto.payrollCycleId,
    );
  }

  @Post('employee')
  @HttpCode(HttpStatus.CREATED)
  async generateEmployeeReport() {
    return this.reportService.generateEmployeeReport('tenant-id-placeholder');
  }

  @Get()
  async getAllReports() {
    return this.reportService.getAllReports('tenant-id-placeholder');
  }

  @Get(':reportId')
  async getReportById(@Param('reportId') reportId: string) {
    return this.reportService.getReportById(reportId);
  }
}
