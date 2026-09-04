import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { RequestLoanDto } from './dto/loan.dto';

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async requestLoan(@Body() dto: RequestLoanDto) {
    return this.loanService.requestLoan(
      'employee-id-placeholder',
      dto.loanTypeId,
      dto.amount,
    );
  }

  @Get()
  async findAll() {
    return this.loanService.findAll('tenant-id-placeholder');
  }

  @Get('types')
  async findAllTypes() {
    return this.loanService.findAllLoanTypes('tenant-id-placeholder');
  }

  @Get('employee/:employeeId')
  async findActiveByEmployee(@Param('employeeId') employeeId: string) {
    return this.loanService.findActiveByEmployee(employeeId);
  }

  @Post('installments/:id/pay')
  @HttpCode(HttpStatus.OK)
  async payInstallment(@Param('id') id: string) {
    return this.loanService.payInstallment(id);
  }
}
