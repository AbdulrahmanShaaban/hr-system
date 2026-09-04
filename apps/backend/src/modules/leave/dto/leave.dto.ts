import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RequestLeaveDto {
  @IsString()
  leaveTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
