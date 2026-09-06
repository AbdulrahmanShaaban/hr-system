import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto, QueryRequestDto, ReviewRequestDto } from './dto/create-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('employeeId') employeeId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestService.create(tenantId, employeeId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('employeeId') employeeId: string,
    @Query() query: QueryRequestDto,
  ) {
    return this.requestService.findAll(tenantId, employeeId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.requestService.findOne(id, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('employeeId') employeeId: string,
    @Param('id') id: string,
  ) {
    return this.requestService.cancel(id, tenantId, employeeId);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
  ) {
    return this.requestService.approve(id, tenantId, userId, dto);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
  ) {
    return this.requestService.reject(id, tenantId, userId, dto);
  }
}
