import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.employeeService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(tenantId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
