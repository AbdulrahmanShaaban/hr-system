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
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('cycles')
  async createCycle(@CurrentTenant() tenantId: string, @Body() dto: CreateCycleDto) {
    return this.payrollService.createCycle(tenantId, dto.month, dto.year);
  }

  @Get('cycles')
  async listCycles(@CurrentTenant() tenantId: string) {
    return this.payrollService.listCycles(tenantId);
  }

  @Post('cycles/:id/process')
  @HttpCode(HttpStatus.OK)
  async processCycle(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.payrollService.processCycle(id, tenantId);
  }

  @Post('cycles/:id/finalize')
  @HttpCode(HttpStatus.OK)
  async finalizeCycle(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.payrollService.finalizePayrollCycle(id, tenantId);
  }

  @Get('cycles/:id/payslips')
  async getPayslips(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.payrollService.getPayslips(id, tenantId);
  }

  @Post('adjustments')
  async createAdjustment(@CurrentTenant() tenantId: string, @Body() dto: CreateAdjustmentDto) {
    return this.payrollService.adjustPayslip(dto.employeeId, dto.payrollCycleId, {
      type: dto.type,
      amount: dto.amount,
      reason: dto.reason,
    });
  }
}
