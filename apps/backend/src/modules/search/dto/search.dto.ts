import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchEmployeesDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class IndexEmployeeDto {
  @IsString()
  id!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  employeeCode!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class BulkIndexEmployeesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndexEmployeeDto)
  employees!: IndexEmployeeDto[];
}
