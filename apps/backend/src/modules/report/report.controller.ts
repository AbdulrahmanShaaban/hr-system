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
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('attendance')
  @HttpCode(HttpStatus.CREATED)
  async generateAttendanceReport(
    @CurrentTenant() tenantId: string,
    @Body() dto: GenerateAttendanceReportDto,
  ) {
    return this.reportService.generateAttendanceReport(
      tenantId,
      dto.startDate,
      dto.endDate,
    );
  }

  @Post('payroll')
  @HttpCode(HttpStatus.CREATED)
  async generatePayrollReport(
    @CurrentTenant() tenantId: string,
    @Body() dto: GeneratePayrollReportDto,
  ) {
    return this.reportService.generatePayrollReport(
      tenantId,
      dto.payrollCycleId,
    );
  }

  @Post('employee')
  @HttpCode(HttpStatus.CREATED)
  async generateEmployeeReport(@CurrentTenant() tenantId: string) {
    return this.reportService.generateEmployeeReport(tenantId);
  }

  @Get()
  async getAllReports(@CurrentTenant() tenantId: string) {
    return this.reportService.getAllReports(tenantId);
  }

  @Get(':reportId')
  async getReportById(@Param('reportId') reportId: string) {
    return this.reportService.getReportById(reportId);
  }
}
