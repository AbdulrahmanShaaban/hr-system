import { IsString, IsNumber, Min } from 'class-validator';

export class RequestLoanDto {
  @IsString()
  loanTypeId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
