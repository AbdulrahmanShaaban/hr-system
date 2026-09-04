import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalService } from '../approval.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  approvalConfig: {
    findUnique: jest.fn(),
  },
  approvalAction: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('ApprovalService', () => {
  let service: ApprovalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ApprovalService>(ApprovalService);
    jest.clearAllMocks();
  });

  describe('initiateApproval', () => {
    it('should create correct number of approval actions', async () => {
      mockPrisma.approvalConfig.findUnique.mockResolvedValue({
        id: 'cfg-1',
        entityType: 'leave',
        steps: [
          { step: 1, assigneeId: 'mgr-1' },
          { step: 2, assigneeId: 'mgr-2' },
        ],
      });
      mockPrisma.approvalAction.create
        .mockResolvedValueOnce({ id: 'a1', step: 1, status: 'PENDING' })
        .mockResolvedValueOnce({ id: 'a2', step: 2, status: 'PENDING' });

      const result = await service.initiateApproval('leave', 'req-1', 'tenant-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.approvalAction.create).toHaveBeenCalledTimes(2);
    });

    it('should throw if no approval config found', async () => {
      mockPrisma.approvalConfig.findUnique.mockResolvedValue(null);

      await expect(
        service.initiateApproval('leave', 'req-1', 'tenant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if config has no steps', async () => {
      mockPrisma.approvalConfig.findUnique.mockResolvedValue({
        id: 'cfg-1',
        entityType: 'leave',
        steps: [],
      });

      await expect(
        service.initiateApproval('leave', 'req-1', 'tenant-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create actions with PENDING status', async () => {
      mockPrisma.approvalConfig.findUnique.mockResolvedValue({
        id: 'cfg-1',
        entityType: 'leave',
        steps: [{ step: 1, assigneeId: 'mgr-1' }],
      });
      mockPrisma.approvalAction.create.mockResolvedValue({ id: 'a1', status: 'PENDING' });

      await service.initiateApproval('leave', 'req-1', 'tenant-1');

      expect(mockPrisma.approvalAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });

  describe('approveStep', () => {
    it('should approve a step and advance to next', async () => {
      const action = {
        id: 'a1',
        entityType: 'leave',
        entityId: 'req-1',
        step: 1,
        assigneeId: 'mgr-1',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'APPROVED' });
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { ...action, status: 'APPROVED' },
        { id: 'a2', step: 2, assigneeId: 'mgr-2', status: 'PENDING' },
      ]);

      const result = await service.approveStep('a1', 'mgr-1', 'Looks good');

      expect(result.status).toBe('APPROVED');
      expect(mockPrisma.approvalAction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
    });

    it('should emit step.completed event when there is a next step', async () => {
      const action = {
        id: 'a1',
        entityType: 'leave',
        entityId: 'req-1',
        step: 1,
        assigneeId: 'mgr-1',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'APPROVED' });
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { ...action, status: 'APPROVED' },
        { id: 'a2', step: 2, assigneeId: 'mgr-2', status: 'PENDING' },
      ]);

      await service.approveStep('a1', 'mgr-1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'approval.step.completed',
        expect.objectContaining({
          completedStep: 1,
          nextStep: 2,
          nextAssigneeId: 'mgr-2',
        }),
      );
    });

    it('should emit workflow.completed when all steps approved', async () => {
      const action = {
        id: 'a2',
        entityType: 'leave',
        entityId: 'req-1',
        step: 2,
        assigneeId: 'mgr-2',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'APPROVED' });
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { id: 'a1', step: 1, assigneeId: 'mgr-1', status: 'APPROVED' },
        { ...action, status: 'APPROVED' },
      ]);

      await service.approveStep('a2', 'mgr-2');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'approval.workflow.completed',
        expect.objectContaining({
          entityType: 'leave',
          entityId: 'req-1',
        }),
      );
    });

    it('should throw if step is not PENDING', async () => {
      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue({
        id: 'a1',
        status: 'APPROVED',
        assigneeId: 'mgr-1',
      });

      await expect(service.approveStep('a1', 'mgr-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if approver is not the assignee', async () => {
      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue({
        id: 'a1',
        status: 'PENDING',
        assigneeId: 'mgr-1',
      });

      await expect(service.approveStep('a1', 'wrong-person')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not emit step.completed if no next step exists', async () => {
      const action = {
        id: 'a1',
        entityType: 'leave',
        entityId: 'req-1',
        step: 1,
        assigneeId: 'mgr-1',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'APPROVED' });
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { ...action, status: 'APPROVED' },
      ]);

      await service.approveStep('a1', 'mgr-1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'approval.workflow.completed',
        expect.anything(),
      );
      expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
        'approval.step.completed',
        expect.anything(),
      );
    });
  });

  describe('rejectStep', () => {
    it('should reject a step and cancel remaining steps', async () => {
      const action = {
        id: 'a1',
        entityType: 'leave',
        entityId: 'req-1',
        step: 1,
        assigneeId: 'mgr-1',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'REJECTED' });
      mockPrisma.approvalAction.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.rejectStep('a1', 'mgr-1', 'Not approved');

      expect(mockPrisma.approvalAction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'REJECTED' }),
        }),
      );
      expect(mockPrisma.approvalAction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'CANCELLED' },
        }),
      );
    });

    it('should emit workflow.rejected event', async () => {
      const action = {
        id: 'a1',
        entityType: 'leave',
        entityId: 'req-1',
        step: 1,
        assigneeId: 'mgr-1',
        status: 'PENDING',
      };

      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue(action);
      mockPrisma.approvalAction.update.mockResolvedValue({ ...action, status: 'REJECTED' });
      mockPrisma.approvalAction.updateMany.mockResolvedValue({ count: 1 });

      await service.rejectStep('a1', 'mgr-1', 'Denied');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'approval.workflow.rejected',
        expect.objectContaining({
          entityType: 'leave',
          entityId: 'req-1',
          rejectedStep: 1,
          rejectorId: 'mgr-1',
          comment: 'Denied',
        }),
      );
    });

    it('should throw if step is not PENDING', async () => {
      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue({
        id: 'a1',
        status: 'APPROVED',
        assigneeId: 'mgr-1',
      });

      await expect(service.rejectStep('a1', 'mgr-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if approver is not the assignee', async () => {
      mockPrisma.approvalAction.findUniqueOrThrow.mockResolvedValue({
        id: 'a1',
        status: 'PENDING',
        assigneeId: 'mgr-1',
      });

      await expect(service.rejectStep('a1', 'wrong-person')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getActionsForEntity', () => {
    it('should return actions for entity', async () => {
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { id: 'a1', step: 1, status: 'APPROVED' },
        { id: 'a2', step: 2, status: 'PENDING' },
      ]);

      const result = await service.getActionsForEntity('leave', 'req-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('getPendingForApprover', () => {
    it('should return pending actions for assignee', async () => {
      mockPrisma.approvalAction.findMany.mockResolvedValue([
        { id: 'a1', assigneeId: 'mgr-1', status: 'PENDING' },
      ]);

      const result = await service.getPendingForApprover('mgr-1');
      expect(result).toHaveLength(1);
    });
  });
});
