import { IsString, IsOptional } from 'class-validator';

export class ClockInDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockOutDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAttendanceDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}
