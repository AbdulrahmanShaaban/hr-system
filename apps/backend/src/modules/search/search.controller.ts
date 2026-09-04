import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchEmployeesDto,
  IndexEmployeeDto,
  BulkIndexEmployeesDto,
} from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('employees')
  async searchEmployees(
    @Query('q') query: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.searchService.searchEmployees(
      tenantId ?? 'tenant-id-placeholder',
      query,
    );
  }

  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  async indexEmployee(@Body() dto: IndexEmployeeDto) {
    return this.searchService.indexEmployee({
      id: dto.id,
      tenantId: dto.tenantId,
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      position: dto.position,
      phone: dto.phone,
      email: dto.email,
      department: dto.department,
      status: dto.status,
    });
  }

  @Post('employees/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkIndexEmployees(@Body() dto: BulkIndexEmployeesDto) {
    return this.searchService.indexEmployees(dto.employees);
  }

  @Delete('employees/:employeeId')
  @HttpCode(HttpStatus.OK)
  async deleteIndex(@Param('employeeId') employeeId: string) {
    return this.searchService.deleteIndex(employeeId);
  }

  @Post('reindex')
  @HttpCode(HttpStatus.OK)
  async reindexAll(@Query('tenantId') tenantId: string) {
    return this.searchService.reindexAll(tenantId ?? 'tenant-id-placeholder');
  }
}
