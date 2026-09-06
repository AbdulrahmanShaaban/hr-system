import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from './dto/salary-component.dto';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

interface FormulaNode {
  type: 'FIXED' | 'VARIABLE' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
  value?: number;
  variable?: string;
  left?: FormulaNode;
  right?: FormulaNode;
}

const ALLOWED_VARIABLES = [
  'base_salary',
  'days_present',
  'days_absent',
  'paid_leave_days',
  'unpaid_leave_days',
  'overtime_minutes',
  'working_days',
];

@Injectable()
export class SalaryComponentService {
  constructor(private readonly prisma: PrismaService) {}

  validateFormula(node: FormulaNode): void {
    if (!node || typeof node !== 'object') {
      throw new BadRequestException('Invalid formula: must be an object');
    }
    if (!node.type) {
      throw new BadRequestException('Invalid formula node: missing type');
    }

    switch (node.type) {
      case 'FIXED':
        if (typeof node.value !== 'number') {
          throw new BadRequestException('FIXED node must have a numeric value');
        }
        break;

      case 'VARIABLE':
        if (!node.variable || !ALLOWED_VARIABLES.includes(node.variable)) {
          throw new BadRequestException(
            `VARIABLE node must reference an allowed variable: ${ALLOWED_VARIABLES.join(', ')}`,
          );
        }
        break;

      case 'ADD':
      case 'SUBTRACT':
      case 'MULTIPLY':
      case 'DIVIDE':
        if (!node.left || !node.right) {
          throw new BadRequestException(`${node.type} node must have left and right children`);
        }
        this.validateFormula(node.left);
        this.validateFormula(node.right);
        break;

      default:
        throw new BadRequestException(`Unknown formula node type: ${node.type}`);
    }
  }

  async create(tenantId: string, dto: CreateSalaryComponentDto) {
    this.validateFormula(dto.formula as unknown as FormulaNode);

    const existing = await this.prisma.salaryComponent.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (existing) {
      throw new BadRequestException('A salary component with this name already exists');
    }

    return this.prisma.salaryComponent.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        formula: dto.formula as Prisma.InputJsonValue,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async findAll(tenantId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const where: Prisma.SalaryComponentWhereInput = { tenantId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    const [data, total] = await Promise.all([
      this.prisma.salaryComponent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.salaryComponent.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const comp = await this.prisma.salaryComponent.findUnique({ where: { id } });
    if (!comp) throw new NotFoundException('Salary component not found');
    return comp;
  }

  async update(id: string, dto: UpdateSalaryComponentDto) {
    const existing = await this.findOne(id);

    if (dto.formula) {
      this.validateFormula(dto.formula as unknown as FormulaNode);
    }

    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.prisma.salaryComponent.findUnique({
        where: { tenantId_name: { tenantId: existing.tenantId, name: dto.name } },
      });
      if (nameTaken) {
        throw new BadRequestException('A salary component with this name already exists');
      }
    }

    return this.prisma.salaryComponent.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.formula && { formula: dto.formula as Prisma.InputJsonValue }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.salaryComponent.delete({ where: { id } });
  }
}
