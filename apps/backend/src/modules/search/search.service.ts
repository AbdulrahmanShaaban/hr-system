import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client!: MeiliSearch;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const host = this.config.get<string>('MEILISEARCH_HOST', 'http://localhost:7700');
    const apiKey = this.config.get<string>('MEILISEARCH_API_KEY', '');

    this.client = new MeiliSearch({ host, apiKey });
    this.logger.log('Meilisearch client initialized');
  }

  async ensureIndex() {
    const index = this.client.index('employees');

    try {
      await index.fetchInfo();
    } catch {
      await this.client.createIndex('employees', { primaryKey: 'id' });
      this.logger.log('Created employees index');
    }

    await index.updateSearchableAttributes([
      'employeeCode',
      'firstName',
      'lastName',
      'position',
      'department',
      'email',
      'phone',
    ]);

    await index.updateFilterableAttributes(['tenantId', 'status']);

    return index;
  }

  async indexEmployee(employee: {
    id: string;
    tenantId: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    position?: string | null;
    phone?: string | null;
    email?: string | null;
    department?: string | null;
    status?: string | null;
  }) {
    const index = await this.ensureIndex();
    return index.addDocuments([
      {
        id: employee.id,
        tenantId: employee.tenantId,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position ?? '',
        phone: employee.phone ?? '',
        email: employee.email ?? '',
        department: employee.department ?? '',
        status: employee.status ?? '',
      },
    ]);
  }

  async indexEmployees(
    employees: {
      id: string;
      tenantId: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
      position?: string | null;
      phone?: string | null;
      email?: string | null;
      department?: string | null;
      status?: string | null;
    }[],
  ) {
    const index = await this.ensureIndex();
    return index.addDocuments(
      employees.map((e) => ({
        id: e.id,
        tenantId: e.tenantId,
        employeeCode: e.employeeCode,
        firstName: e.firstName,
        lastName: e.lastName,
        position: e.position ?? '',
        phone: e.phone ?? '',
        email: e.email ?? '',
        department: e.department ?? '',
        status: e.status ?? '',
      })),
    );
  }

  async searchEmployees(tenantId: string, query: string) {
    const index = await this.ensureIndex();
    const result = await index.search(query, {
      filter: [`tenantId = "${tenantId}"`],
      limit: 50,
    });

    return {
      hits: result.hits,
      estimatedTotalHits: result.estimatedTotalHits,
      processingTimeMs: result.processingTimeMs,
    };
  }

  async deleteIndex(employeeId: string) {
    const index = await this.ensureIndex();
    return index.deleteDocument(employeeId);
  }

  async reindexAll(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId },
      include: { department: true },
    });

    const index = await this.ensureIndex();

    const documents = employees.map((e) => ({
      id: e.id,
      tenantId: e.tenantId,
      employeeCode: e.employeeCode,
      firstName: e.firstName,
      lastName: e.lastName,
      position: e.position ?? '',
      phone: e.phone ?? '',
      email: '',
      department: e.department?.name ?? '',
      status: e.status,
    }));

    const task = await index.addDocuments(documents);

    return {
      taskId: task.taskUid,
      indexed: documents.length,
    };
  }
}
