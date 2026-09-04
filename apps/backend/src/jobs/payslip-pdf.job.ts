import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '@core/database/prisma.service';

interface PayslipPdfJobData {
  payrollCycleId: string;
  employeeId?: string;
}

export function createPayslipPdfWorker(prisma: PrismaService): Worker {
  const logger = new Logger('PayslipPdfJob');

  const worker = new Worker(
    'payslip-pdf',
    async (job: Job<PayslipPdfJobData>) => {
      const { payrollCycleId, employeeId } = job.data;

      logger.log(`Processing payslip PDF generation for cycle ${payrollCycleId}`);

      const where: Record<string, unknown> = { payrollCycleId };
      if (employeeId) {
        where.employeeId = employeeId;
      }

      const payslips = await prisma.payslip.findMany({
        where,
        include: { employee: true, components: true },
      });

      for (const payslip of payslips) {
        await job.updateProgress(
          ((payslips.indexOf(payslip) + 1) / payslips.length) * 100,
        );

        logger.log(
          `Generating PDF for employee ${payslip.employee.firstName} ${payslip.employee.lastName}`,
        );

        // Placeholder: in production, generate actual PDF and store URL
        // await pdfGenerator.generate(payslip);
      }

      logger.log(`Completed PDF generation for ${payslips.length} payslips`);
      return { generated: payslips.length };
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
      concurrency: 2,
    },
  );

  worker.on('completed', (job) => {
    logger.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
