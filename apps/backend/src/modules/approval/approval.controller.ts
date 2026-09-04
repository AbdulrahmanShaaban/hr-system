import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApproveStepDto, RejectStepDto } from './dto/approval.dto';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('pending/:approverId')
  async getPending(@Param('approverId') approverId: string) {
    return this.approvalService.getPendingForApprover(approverId);
  }

  @Get(':entityType/:entityId')
  async getActionsForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.approvalService.getActionsForEntity(entityType, entityId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveStep(
    @Param('id') id: string,
    @Body() dto: ApproveStepDto,
  ) {
    return this.approvalService.approveStep(id, 'approver-id-placeholder', dto.comment);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectStep(
    @Param('id') id: string,
    @Body() dto: RejectStepDto,
  ) {
    return this.approvalService.rejectStep(id, 'approver-id-placeholder', dto.comment);
  }
}
