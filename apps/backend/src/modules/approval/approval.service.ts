import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface ApprovalStep {
  step: number;
  assigneeId: string;
}

@Injectable()
export class ApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async initiateApproval(entityType: string, entityId: string, tenantId: string) {
    const config = await this.prisma.approvalConfig.findUnique({
      where: { tenantId_entityType: { tenantId, entityType } },
    });

    if (!config) {
      throw new BadRequestException(`No approval config found for entity type: ${entityType}`);
    }

    const steps = config.steps as unknown as ApprovalStep[];
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new BadRequestException('Approval config has no steps');
    }

    const actions = await Promise.all(
      steps.map((step) =>
        this.prisma.approvalAction.create({
          data: {
            entityType,
            entityId,
            step: step.step,
            assigneeId: step.assigneeId,
            status: 'PENDING',
          },
        }),
      ),
    );

    return actions;
  }

  async approveStep(actionId: string, approverId: string, comment?: string) {
    const action = await this.prisma.approvalAction.findUniqueOrThrow({
      where: { id: actionId },
    });

    if (action.status !== 'PENDING') {
      throw new BadRequestException('This step has already been acted upon');
    }

    if (action.assigneeId !== approverId) {
      throw new BadRequestException('You are not assigned to this approval step');
    }

    const updated = await this.prisma.approvalAction.update({
      where: { id: actionId },
      data: {
        status: 'APPROVED',
        comment: comment ?? null,
        actedAt: new Date(),
      },
    });

    const allActions = await this.prisma.approvalAction.findMany({
      where: {
        entityType: action.entityType,
        entityId: action.entityId,
      },
      orderBy: { step: 'asc' },
    });

    const currentStepIdx = allActions.findIndex((a) => a.id === actionId);

    const nextStep = allActions[currentStepIdx + 1];
    if (nextStep && nextStep.status === 'PENDING') {
      this.eventEmitter.emit('approval.step.completed', {
        entityType: action.entityType,
        entityId: action.entityId,
        completedStep: action.step,
        nextStep: nextStep.step,
        nextAssigneeId: nextStep.assigneeId,
      });
    }

    const allApproved = allActions.every((a) => a.status === 'APPROVED');
    if (allApproved) {
      this.eventEmitter.emit('approval.workflow.completed', {
        entityType: action.entityType,
        entityId: action.entityId,
      });
    }

    return updated;
  }

  async rejectStep(actionId: string, approverId: string, comment?: string) {
    const action = await this.prisma.approvalAction.findUniqueOrThrow({
      where: { id: actionId },
    });

    if (action.status !== 'PENDING') {
      throw new BadRequestException('This step has already been acted upon');
    }

    if (action.assigneeId !== approverId) {
      throw new BadRequestException('You are not assigned to this approval step');
    }

    const updated = await this.prisma.approvalAction.update({
      where: { id: actionId },
      data: {
        status: 'REJECTED',
        comment: comment ?? null,
        actedAt: new Date(),
      },
    });

    const remaining = await this.prisma.approvalAction.updateMany({
      where: {
        entityType: action.entityType,
        entityId: action.entityId,
        status: 'PENDING',
        step: { gt: action.step },
      },
      data: { status: 'CANCELLED' },
    });

    this.eventEmitter.emit('approval.workflow.rejected', {
      entityType: action.entityType,
      entityId: action.entityId,
      rejectedStep: action.step,
      rejectorId: approverId,
      comment,
    });

    return updated;
  }

  async getActionsForEntity(entityType: string, entityId: string) {
    return this.prisma.approvalAction.findMany({
      where: { entityType, entityId },
      include: { assignee: true },
      orderBy: { step: 'asc' },
    });
  }

  async getPendingForApprover(assigneeId: string) {
    return this.prisma.approvalAction.findMany({
      where: { assigneeId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }
}
