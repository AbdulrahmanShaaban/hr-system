import { PrismaClient, Permission } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Qawam',
      slug: 'qawam',
      email: 'info@qawam.sa',
      phone: '+966 50 123 4567',
      address: 'Riyadh, Saudi Arabia',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
    },
  });
  console.log(`Created tenant: ${tenant.name}`);

  const ownerHash = await bcrypt.hash('Owner@1234', 10);
  const empHash = await bcrypt.hash('Emp@12345', 10);
  const platformHash = await bcrypt.hash('Platform@123', 10);

  const ownerUser = await prisma.user.create({
    data: { email: 'faisal@qawam.sa', passwordHash: ownerHash, isActive: true },
  });
  const empUser = await prisma.user.create({
    data: { email: 'sultan.midhani@qawam.sa', passwordHash: empHash, isActive: true },
  });
  const platformUser = await prisma.user.create({
    data: { email: 'admin@qawam.sa', passwordHash: platformHash, isActive: true },
  });
  console.log('Created 3 users');

  const departments = await Promise.all([
    prisma.department.create({ data: { tenantId: tenant.id, name: 'تقنية المعلومات' } }),
    prisma.department.create({ data: { tenantId: tenant.id, name: 'الموارد البشرية' } }),
    prisma.department.create({ data: { tenantId: tenant.id, name: 'المالية' } }),
  ]);
  console.log(`Created ${departments.length} departments`);

  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: 'Full Access', code: 'FULL_ACCESS' } }),
    prisma.permission.create({ data: { name: 'Manage Employees', code: 'MANAGE_EMPLOYEES' } }),
    prisma.permission.create({ data: { name: 'Manage Payroll', code: 'MANAGE_PAYROLL' } }),
    prisma.permission.create({ data: { name: 'Manage Attendance', code: 'MANAGE_ATTENDANCE' } }),
    prisma.permission.create({ data: { name: 'Manage Leaves', code: 'MANAGE_LEAVES' } }),
    prisma.permission.create({ data: { name: 'View Reports', code: 'VIEW_REPORTS' } }),
    prisma.permission.create({ data: { name: 'Manage Departments', code: 'MANAGE_DEPARTMENTS' } }),
  ]);

  const roles = await Promise.all([
    prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'المالك',
        isSystem: true,
        permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
      },
    }),
    prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'موظف',
        isSystem: true,
        permissions: {
          create: permissions
            .filter((p) => ['VIEW_REPORTS', 'MANAGE_ATTENDANCE'].includes(p.code))
            .map((p) => ({ permissionId: p.id })),
        },
      },
    }),
    prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'مدير المنصة',
        isSystem: true,
        permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
      },
    }),
  ]);
  console.log(`Created ${roles.length} roles`);

  const shifts = await Promise.all([
    prisma.shift.create({
      data: {
        tenantId: tenant.id,
        name: 'وردية صباحية',
        startTime: '09:00',
        endTime: '17:00',
        gracePeriodMinutes: 15,
      },
    }),
  ]);
  console.log(`Created ${shifts.length} shift`);

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        userId: ownerUser.id,
        employeeCode: 'EMP001',
        firstName: 'فيصل',
        lastName: 'الشمري',
        phone: '+966 50 111 2222',
        hireDate: new Date('2023-01-15'),
        status: 'ACTIVE',
        position: 'المالك',
        basicSalary: 60000,
        departmentId: departments[0].id,
        roleId: roles[0].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        userId: empUser.id,
        employeeCode: 'EMP002',
        firstName: 'سلطان',
        lastName: 'المدهني',
        phone: '+966 50 222 3333',
        hireDate: new Date('2023-06-01'),
        status: 'ACTIVE',
        position: 'مبرمج',
        basicSalary: 30000,
        departmentId: departments[0].id,
        roleId: roles[1].id,
        shiftId: shifts[0].id,
      },
    }),
  ]);
  console.log(`Created ${employees.length} employees`);

  const leaveTypes = await Promise.all([
    prisma.leaveType.create({
      data: { tenantId: tenant.id, name: 'إجازة سنوية', defaultDays: 21, isPaid: true, carriesForward: true },
    }),
    prisma.leaveType.create({
      data: { tenantId: tenant.id, name: 'إجازة مرضية', defaultDays: 15, isPaid: true, carriesForward: false },
    }),
    prisma.leaveType.create({
      data: { tenantId: tenant.id, name: 'إجازة شخصية', defaultDays: 7, isPaid: true, carriesForward: false },
    }),
  ]);
  console.log(`Created ${leaveTypes.length} leave types`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
