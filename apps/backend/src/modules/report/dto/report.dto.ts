import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum ReportType {
  ATTENDANCE = 'ATTENDANCE',
  PAYROLL = 'PAYROLL',
  EMPLOYEE = 'EMPLOYEE',
}

export class GenerateAttendanceReportDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class GeneratePayrollReportDto {
  @IsString()
  payrollCycleId!: string;
}
