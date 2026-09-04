import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(
    tenantId: string,
    name: string,
    steps: { stepName: string; description?: string }[],
  ) {
    if (!steps.length) {
      throw new BadRequestException('Template must have at least one step');
    }

    const orderedSteps = steps.map((s, i) => ({
      stepName: s.stepName,
      stepOrder: i + 1,
      ...(s.description ? { description: s.description } : {}),
    }));

    return this.prisma.onboardingTemplate.create({
      data: {
        tenantId,
        name,
        steps: orderedSteps,
      },
    });
  }

  async getTemplates(tenantId: string) {
    return this.prisma.onboardingTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplateById(templateId: string) {
    const template = await this.prisma.onboardingTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    return template;
  }

  async startOnboarding(employeeId: string, templateId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const template = await this.getTemplateById(templateId);
    const stepDefinitions = template.steps as { stepName: string; stepOrder: number; description?: string }[];

    const existingSteps = await this.prisma.onboardingStep.findMany({
      where: { employeeId },
    });

    if (existingSteps.length) {
      throw new BadRequestException('Employee already has onboarding steps');
    }

    const created = await this.prisma.onboardingStep.createMany({
      data: stepDefinitions.map((s) => ({
        employeeId,
        templateId,
        stepName: s.stepName,
        stepOrder: s.stepOrder,
        isCompleted: false,
      })),
    });

    return this.prisma.onboardingStep.findMany({
      where: { employeeId },
      orderBy: { stepOrder: 'asc' },
    });
  }

  async completeStep(stepId: string, employeeId: string) {
    const step = await this.prisma.onboardingStep.findUnique({
      where: { id: stepId },
    });

    if (!step) {
      throw new NotFoundException('Onboarding step not found');
    }

    if (step.employeeId !== employeeId) {
      throw new BadRequestException('Step does not belong to this employee');
    }

    if (step.isCompleted) {
      throw new BadRequestException('Step is already completed');
    }

    return this.prisma.onboardingStep.update({
      where: { id: stepId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  async getEmployeeOnboarding(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.onboardingStep.findMany({
      where: { employeeId },
      orderBy: { stepOrder: 'asc' },
      include: { template: true },
    });
  }
}
