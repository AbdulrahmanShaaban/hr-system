import { IsString, IsOptional } from 'class-validator';

export class ApproveStepDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectStepDto {
  @IsOptional()
  @IsString()
  comment?: string;
}
