import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './core/config/configuration';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { DepartmentModule } from './modules/department/department.module';
import { RoleModule } from './modules/role/role.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ShiftModule } from './modules/shift/shift.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { LoanModule } from './modules/loan/loan.module';
import { SalaryComponentModule } from './modules/salary-component/salary-component.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { DocumentModule } from './modules/document/document.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { AuditModule } from './modules/audit/audit.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ReportModule } from './modules/report/report.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    TenantModule,
    DepartmentModule,
    RoleModule,
    EmployeeModule,
    ShiftModule,
    AttendanceModule,
    LeaveModule,
    LoanModule,
    SalaryComponentModule,
    PayrollModule,
    DocumentModule,
    NotificationModule,
    ApprovalModule,
    AuditModule,
    OnboardingModule,
    ReportModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
