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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async requestLoan(@CurrentUser('employeeId') employeeId: string, @Body() dto: RequestLoanDto) {
    return this.loanService.requestLoan(
      employeeId,
      dto.loanTypeId,
      dto.amount,
    );
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.loanService.findAll(tenantId);
  }

  @Get('types')
  async findAllTypes(@CurrentTenant() tenantId: string) {
    return this.loanService.findAllLoanTypes(tenantId);
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
