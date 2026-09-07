import { IsString, IsOptional } from 'class-validator';

export class ClockInDto {
  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Kept for backward compatibility: older frontend builds POST
   * `{ employeeId }`. The server resolves the employee from the JWT and
   * only falls back to this field (e.g. admin recording for someone else).
   * With `forbidNonWhitelisted: false` it would be stripped silently, but
   * declaring it makes the contract explicit and avoids 400s on strict setups.
   */
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class ClockOutDto {
  @IsOptional()
  @IsString()
  notes?: string;

  /** @see ClockInDto.employeeId */
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class GetAttendanceDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}
