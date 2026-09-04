import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        tenantId,
        title: dto.title,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        employeeId: dto.employeeId,
        category: dto.category,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.document.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.document.delete({ where: { id } });
  }
}
