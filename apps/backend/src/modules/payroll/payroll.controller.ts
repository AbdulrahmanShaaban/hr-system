import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('cycles')
  async createCycle(@Body() dto: CreateCycleDto) {
    return this.payrollService.createCycle('tenant-id-placeholder', dto.month, dto.year);
  }

  @Get('cycles')
  async listCycles() {
    return this.payrollService.listCycles('tenant-id-placeholder');
  }

  @Post('cycles/:id/process')
  @HttpCode(HttpStatus.OK)
  async processCycle(@Param('id') id: string) {
    return this.payrollService.processCycle(id);
  }

  @Post('cycles/:id/finalize')
  @HttpCode(HttpStatus.OK)
  async finalizeCycle(@Param('id') id: string) {
    return this.payrollService.finalizePayrollCycle(id);
  }

  @Get('cycles/:id/payslips')
  async getPayslips(@Param('id') id: string) {
    return this.payrollService.getPayslips(id);
  }

  @Post('adjustments')
  async createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return this.payrollService.adjustPayslip(dto.employeeId, dto.payrollCycleId, {
      type: dto.type,
      amount: dto.amount,
      reason: dto.reason,
    });
  }
}
