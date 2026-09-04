import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  private readonly queues: Map<string, Queue> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async addJob(queueName: string, jobName: string, data: Record<string, unknown>) {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data);
    this.logger.log(`Job ${jobName} added to queue ${queueName} with id ${job.id}`);
    return job;
  }

  async getJobCounts(queueName: string) {
    const queue = this.getQueue(queueName);
    return queue.getJobCounts('waiting', 'active', 'completed', 'failed');
  }
}
