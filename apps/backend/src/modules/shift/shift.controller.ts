import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  async create(@Body() dto: CreateShiftDto) {
    return this.shiftService.create('tenant-id-placeholder', dto);
  }

  @Get()
  async findAll() {
    return this.shiftService.findAll('tenant-id-placeholder');
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
