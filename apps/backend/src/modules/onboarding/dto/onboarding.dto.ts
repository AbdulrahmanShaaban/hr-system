import { IsString, IsArray, ValidateNested, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class OnboardingStepDefinition {
  @IsString()
  stepName!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateOnboardingTemplateDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingStepDefinition)
  steps!: OnboardingStepDefinition[];
}

export class StartOnboardingDto {
  @IsString()
  employeeId!: string;

  @IsString()
  templateId!: string;
}

export class CompleteStepDto {
  @IsString()
  employeeId!: string;
}
