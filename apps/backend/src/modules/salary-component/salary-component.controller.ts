import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SalaryComponentService } from './salary-component.service';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from './dto/salary-component.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('salary-components')
export class SalaryComponentController {
  constructor(private readonly salaryComponentService: SalaryComponentService) {}

  @Post()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateSalaryComponentDto) {
    return this.salaryComponentService.create(tenantId, dto);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.salaryComponentService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salaryComponentService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalaryComponentDto) {
    return this.salaryComponentService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.salaryComponentService.remove(id);
  }
}
