import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  async create(@Body() dto: CreateDocumentDto) {
    return this.documentService.create('tenant-id-placeholder', dto);
  }

  @Get()
  async findAll() {
    return this.documentService.findAll('tenant-id-placeholder');
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.documentService.findByEmployee(employeeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
