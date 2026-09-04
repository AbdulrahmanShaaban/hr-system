import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Prisma } from '@prisma/client';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Post()
  create(@Body() data: Prisma.TenantCreateInput) {
    return this.tenantService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.TenantUpdateInput) {
    return this.tenantService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
