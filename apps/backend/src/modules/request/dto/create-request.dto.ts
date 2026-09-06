import { IsString, IsOptional, IsDateString, IsNumber, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsString()
  @IsIn(['OVERTIME', 'GENERAL'])
  type!: 'OVERTIME' | 'GENERAL';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.25)
  @Type(() => Number)
  hours?: number;
}

export class ReviewRequestDto {
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class QueryRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['OVERTIME', 'GENERAL'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  @IsIn(['0', '1'])
  mine?: string;
}
