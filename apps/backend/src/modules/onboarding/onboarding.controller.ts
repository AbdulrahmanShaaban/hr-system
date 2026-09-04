import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import {
  CreateOnboardingTemplateDto,
  StartOnboardingDto,
  CompleteStepDto,
} from './dto/onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('templates')
  async createTemplate(@Body() dto: CreateOnboardingTemplateDto) {
    return this.onboardingService.createTemplate(
      'tenant-id-placeholder',
      dto.name,
      dto.steps,
    );
  }

  @Get('templates')
  async getTemplates() {
    return this.onboardingService.getTemplates('tenant-id-placeholder');
  }

  @Get('templates/:templateId')
  async getTemplateById(@Param('templateId') templateId: string) {
    return this.onboardingService.getTemplateById(templateId);
  }

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startOnboarding(@Body() dto: StartOnboardingDto) {
    return this.onboardingService.startOnboarding(dto.employeeId, dto.templateId);
  }

  @Post('steps/:stepId/complete')
  @HttpCode(HttpStatus.OK)
  async completeStep(
    @Param('stepId') stepId: string,
    @Body() dto: CompleteStepDto,
  ) {
    return this.onboardingService.completeStep(stepId, dto.employeeId);
  }

  @Get('employee/:employeeId')
  async getEmployeeOnboarding(@Param('employeeId') employeeId: string) {
    return this.onboardingService.getEmployeeOnboarding(employeeId);
  }
}
