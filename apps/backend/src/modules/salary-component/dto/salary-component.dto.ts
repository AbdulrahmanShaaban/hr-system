import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';

export enum ComponentType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
}

export class CreateSalaryComponentDto {
  @IsString()
  name!: string;

  @IsEnum(ComponentType)
  type!: ComponentType;

  @IsObject()
  formula!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateSalaryComponentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ComponentType)
  type?: ComponentType;

  @IsOptional()
  @IsObject()
  formula?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
