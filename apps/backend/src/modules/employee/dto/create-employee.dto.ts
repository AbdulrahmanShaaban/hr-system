import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsEmail,
  Min,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const ACTIVE_STATUSES = [
  'ACTIVE',
  'ON_LEAVE',
  'TERMINATED',
  'SUSPENDED',
  // Frontend alias: the employees table/form uses lowercase "active" /
  // "inactive" / "on-leave". Transformed to uppercase before validation;
  // INACTIVE is mapped to SUSPENDED in the service layer.
  'INACTIVE',
] as const;

/** Uppercase incoming status so frontend values like "active" validate. */
function upperStatus(value: unknown): unknown {
  return typeof value === 'string' ? value.toUpperCase().replace('-', '_') : value;
}

export class CreateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  employeeCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  /**
   * Wizard sends a single `name` ("Ahmed Hassan"). Accepted here and split
   * into first/last name in the service layer.
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  /** Wizard alias for `avatar`. */
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  /** Legacy alias sent by the employees list modal (`joinDate`). */
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsOptional()
  @Transform(({ value }) => upperStatus(value))
  @IsEnum(ACTIVE_STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Type(() => Number)
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

  @IsOptional()
  @IsString()
  userId?: string;

  // ─── Wizard / HR profile fields (accepted, not all persisted yet) ───
  // Declared so the global ValidationPipe never 400s on the rich wizard
  // payload. Non-persisted fields are intentionally ignored by the service
  // until matching columns/tables exist.
  @IsOptional() @IsString() nationalId?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() maritalStatus?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() emergencyContactName?: string;
  @IsOptional() @IsString() emergencyContactRelation?: string;
  @IsOptional() @IsString() emergencyContactPhone?: string;
  @IsOptional() @IsString() subDepartment?: string;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() contractDurationYears?: number;
  @IsOptional() @IsString() workLocation?: string;
  @IsOptional() @IsString() jobRank?: string;
  @IsOptional() @Type(() => Number) @IsNumber() probationDays?: number;
  @IsOptional() @IsString() salaryBasis?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() iban?: string;
  @IsOptional() isGosiRegistered?: boolean;
  @IsOptional() hasHealthInsurance?: boolean;
  @IsOptional() hasTransportAllowance?: boolean;
  @IsOptional() hasHousingAllowance?: boolean;
  @IsOptional() hasMealAllowance?: boolean;
}
