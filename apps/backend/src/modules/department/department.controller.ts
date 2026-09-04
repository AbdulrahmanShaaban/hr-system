import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.departmentService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() data: Prisma.DepartmentCreateInput) {
    return this.departmentService.create({ ...data, tenant: { connect: { id: tenantId } } });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.DepartmentUpdateInput) {
    return this.departmentService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
