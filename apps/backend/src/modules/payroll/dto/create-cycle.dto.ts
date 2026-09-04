import { IsInt, IsPositive, Min, Max } from 'class-validator';

export class CreateCycleDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsInt()
  @IsPositive()
  year!: number;
}
