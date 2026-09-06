import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateShiftDto) {
    return this.shiftService.create(tenantId, dto);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string, @Query() query: PaginationDto) {
    return this.shiftService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.shiftService.remove(id);
  }
}
