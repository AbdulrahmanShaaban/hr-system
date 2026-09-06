import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { LeaveModule } from '../leave/leave.module';
import { PrismaService } from '../../core/database/prisma.service';

@Module({
  imports: [LeaveModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
