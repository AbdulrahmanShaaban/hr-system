import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../core/database/prisma.service';

interface SearchReindexJobData {
  tenantId?: string;
  entityType?: string;
}

export function createSearchReindexWorker(prisma: PrismaService): Worker {
  const logger = new Logger('SearchReindexJob');

  const worker = new Worker(
    'search-reindex',
    async (job: Job<SearchReindexJobData>) => {
      const { tenantId, entityType } = job.data;

      logger.log(`Reindexing search${tenantId ? ` for tenant ${tenantId}` : ''}${entityType ? ` entity: ${entityType}` : ''}`);

      // Placeholder: in production, push to Meilisearch
      // const client = new MeiliSearch({ host: '...' });

      const entities = entityType ? [entityType] : ['employee', 'department', 'shift'];

      for (const entity of entities) {
        await job.updateProgress(
          ((entities.indexOf(entity) + 1) / entities.length) * 100,
        );

        logger.log(`Reindexing ${entity}...`);

        // Placeholder: fetch records and push to Meilisearch
        // const records = await prisma[entity].findMany({ where: { tenantId } });
        // await client.index(entity).addDocuments(records);
      }

      logger.log('Search reindex completed');
      return { reindexed: entities.length };
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
      concurrency: 1,
    },
  );

  worker.on('completed', (job) => {
    logger.log(`Reindex job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Reindex job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
