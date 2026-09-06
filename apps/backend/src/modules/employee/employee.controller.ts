import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { LeaveService } from '../leave/leave.service';
import { PrismaService } from '../../core/database/prisma.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Prisma } from '@prisma/client';

@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.employeeService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeeService.findOne(id, tenantId);
  }

  @Get(':id/leaves')
  async findLeaves(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    await this.employeeService.findOne(id, tenantId);
    const leaves = await this.leaveService.findByEmployee(id);
    return leaves.map((l) => ({
      id: l.id,
      type: l.leaveType?.name ?? 'إجازة',
      fromDate: l.startDate,
      toDate: l.endDate,
      days: l.days,
      status: l.status,
      reason: l.reason,
    }));
  }

  @Get(':id/payroll-slips')
  async findPayrollSlips(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    await this.employeeService.findOne(id, tenantId);
    const slips = await this.prisma.payslip.findMany({
      where: { employeeId: id },
      include: { payrollCycle: true },
      orderBy: [{ payrollCycle: { year: 'desc' } }, { payrollCycle: { month: 'desc' } }],
    });

    return slips.map((s) => ({
      id: s.id,
      month: s.payrollCycle.month,
      year: s.payrollCycle.year,
      cycleStatus: s.payrollCycle.status,
      basicSalary: Number(s.basicSalary),
      totalAllowances: Number(s.totalEarnings) - Number(s.basicSalary),
      overtimeBonus: 0,
      totalDeductions: Number(s.totalDeductions),
      gross: Number(s.totalEarnings),
      netSalary: Number(s.netPay),
      paidAt: s.payrollCycle.paidAt?.toISOString() ?? '',
    }));
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(tenantId, dto);
  }

  @Put(':id')
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.updateEmployee(tenantId, id, body);
  }

  @Patch(':id')
  async patch(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.updateEmployee(tenantId, id, body);
  }

  private async updateEmployee(tenantId: string, id: string, body: Record<string, unknown>) {
    const ALLOWED_STATUS = ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED'] as const;
    const data: Prisma.EmployeeUpdateInput = {};
    if (typeof body.firstName === 'string') data.firstName = body.firstName;
    if (typeof body.lastName === 'string') data.lastName = body.lastName;
    if (typeof body.phone === 'string') data.phone = body.phone;
    if (typeof body.avatar === 'string') data.avatar = body.avatar;
    if (typeof body.position === 'string') data.position = body.position;
    if (typeof body.basicSalary === 'number') data.basicSalary = body.basicSalary;
    if (typeof body.departmentId === 'string') data.department = { connect: { id: body.departmentId } };
    if (typeof body.roleId === 'string') data.role = { connect: { id: body.roleId } };
    if (typeof body.shiftId === 'string') data.shift = { connect: { id: body.shiftId } };
    if (typeof body.employeeCode === 'string') data.employeeCode = body.employeeCode;
    if (typeof body.hireDate === 'string') data.hireDate = new Date(body.hireDate);
    if (typeof body.terminationDate === 'string') data.terminationDate = new Date(body.terminationDate);
    if (body.isActive !== undefined) {
      data.status = body.isActive ? 'ACTIVE' : 'INACTIVE';
    } else if (typeof body.status === 'string' && ALLOWED_STATUS.includes(body.status as typeof ALLOWED_STATUS[number])) {
      data.status = body.status as typeof ALLOWED_STATUS[number];
    }

    await this.employeeService.findOne(id, tenantId);
    return this.prisma.employee.update({ where: { id }, data });
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeeService.remove(id, tenantId);
  }
}
