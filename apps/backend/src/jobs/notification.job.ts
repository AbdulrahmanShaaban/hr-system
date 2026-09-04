import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '@core/database/prisma.service';

interface NotificationJobData {
  employeeId: string;
  title: string;
  message: string;
  type?: string;
}

export function createNotificationWorker(prisma: PrismaService): Worker {
  const logger = new Logger('NotificationJob');

  const worker = new Worker(
    'notification',
    async (job: Job<NotificationJobData>) => {
      const { employeeId, title, message, type } = job.data;

      logger.log(`Sending notification to employee ${employeeId}`);

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true },
      });

      if (!employee) {
        logger.warn(`Employee ${employeeId} not found, skipping notification`);
        return { sent: false };
      }

      // Create in-app notification
      await prisma.notification.create({
        data: {
          tenantId: employee.tenantId,
          employeeId,
          title,
          message,
          type: (type as any) ?? 'INFO',
        },
      });

      // Placeholder: in production, send email via SMTP/SendGrid/etc.
      if (employee.user?.email) {
        logger.log(`[EMAIL PLACEHOLDER] To: ${employee.user.email}, Subject: ${title}, Body: ${message}`);
      }

      logger.log(`Notification sent to ${employee.firstName} ${employee.lastName}`);
      return { sent: true };
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    logger.log(`Notification job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
