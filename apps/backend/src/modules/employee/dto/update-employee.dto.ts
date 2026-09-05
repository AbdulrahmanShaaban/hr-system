import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED'] as const)
  status?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basicSalary?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;
}
