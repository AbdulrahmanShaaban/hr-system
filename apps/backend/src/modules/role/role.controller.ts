import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('permissions')
  findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Get('users')
  findAllUsers(@CurrentTenant() tenantId: string) {
    return this.roleService.findAllUsers(tenantId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.roleService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get(':id/users')
  findRoleUsers(@Param('id') id: string) {
    return this.roleService.findRoleUsers(id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body('name') name: string) {
    return this.roleService.create({ name, tenant: { connect: { id: tenantId } } });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Patch(':id')
  patchUpdate(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Put(':id/permissions')
  assignPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: string[]) {
    return this.roleService.assignPermissions(id, permissionIds);
  }

  @Post(':id/users/unassign')
  unassignUsers(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.roleService.unassignUsers(id, userIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
