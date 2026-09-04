import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export enum AdjustmentType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class CreateAdjustmentDto {
  @IsString()
  payrollCycleId!: string;

  @IsString()
  employeeId!: string;

  @IsEnum(AdjustmentType)
  type!: AdjustmentType;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  referencePayrollCycleId?: string;
}
