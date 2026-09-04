import { PrismaClient, Permission } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      email: 'info@acme.com',
      phone: '+20 123 456 7890',
      address: '123 Business Street, Cairo, Egypt',
      timezone: 'Africa/Cairo',
      currency: 'EGP',
    },
  });
  console.log(`Created tenant: ${tenant.name}`);

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      isActive: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  const departments = await Promise.all([
    prisma.department.create({
      data: { tenantId: tenant.id, name: 'Engineering' },
    }),
    prisma.department.create({
      data: { tenantId: tenant.id, name: 'HR' },
    }),
    prisma.department.create({
      data: { tenantId: tenant.id, name: 'Finance' },
    }),
    prisma.department.create({
      data: { tenantId: tenant.id, name: 'Marketing' },
    }),
    prisma.department.create({
      data: { tenantId: tenant.id, name: 'Operations' },
    }),
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
        name: 'Owner',
        isSystem: true,
        permissions: {
          create: permissions.map((p) => ({ permissionId: p.id })),
        },
      },
    }),
    prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'HR Manager',
        isSystem: true,
        permissions: {
          create: permissions
            .filter((p) => p.code !== 'FULL_ACCESS')
            .map((p) => ({ permissionId: p.id })),
        },
      },
    }),
    prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Employee',
        isSystem: true,
        permissions: {
          create: permissions
            .filter((p) => ['VIEW_REPORTS'].includes(p.code))
            .map((p) => ({ permissionId: p.id })),
        },
      },
    }),
  ]);
  console.log(`Created ${roles.length} roles`);

  const shifts = await Promise.all([
    prisma.shift.create({
      data: {
        tenantId: tenant.id,
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        gracePeriodMinutes: 15,
      },
    }),
    prisma.shift.create({
      data: {
        tenantId: tenant.id,
        name: 'Evening Shift',
        startTime: '14:00',
        endTime: '22:00',
        gracePeriodMinutes: 15,
      },
    }),
  ]);
  console.log(`Created ${shifts.length} shifts`);

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        userId: adminUser.id,
        employeeCode: 'EMP001',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+20 100 111 2222',
        hireDate: new Date('2022-01-15'),
        status: 'ACTIVE',
        position: 'CEO',
        basicSalary: 50000,
        departmentId: departments[0].id,
        roleId: roles[0].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP002',
        firstName: 'Sara',
        lastName: 'Ali',
        phone: '+20 101 222 3333',
        hireDate: new Date('2022-03-20'),
        status: 'ACTIVE',
        position: 'HR Manager',
        basicSalary: 25000,
        departmentId: departments[1].id,
        roleId: roles[1].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP003',
        firstName: 'Mohamed',
        lastName: 'Ibrahim',
        phone: '+20 102 333 4444',
        hireDate: new Date('2022-06-01'),
        status: 'ACTIVE',
        position: 'Senior Engineer',
        basicSalary: 30000,
        departmentId: departments[0].id,
        roleId: roles[2].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP004',
        firstName: 'Fatma',
        lastName: 'Mahmoud',
        phone: '+20 103 444 5555',
        hireDate: new Date('2023-01-10'),
        status: 'ACTIVE',
        position: 'Accountant',
        basicSalary: 20000,
        departmentId: departments[2].id,
        roleId: roles[2].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP005',
        firstName: 'Omar',
        lastName: 'Khaled',
        phone: '+20 104 555 6666',
        hireDate: new Date('2023-03-15'),
        status: 'ACTIVE',
        position: 'Marketing Specialist',
        basicSalary: 18000,
        departmentId: departments[3].id,
        roleId: roles[2].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP006',
        firstName: 'Nour',
        lastName: 'Ahmed',
        phone: '+20 105 666 7777',
        hireDate: new Date('2023-05-20'),
        status: 'ACTIVE',
        position: 'Operations Lead',
        basicSalary: 22000,
        departmentId: departments[4].id,
        roleId: roles[2].id,
        shiftId: shifts[1].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP007',
        firstName: 'Yasmin',
        lastName: 'Farouk',
        phone: '+20 106 777 8888',
        hireDate: new Date('2023-07-01'),
        status: 'ON_LEAVE',
        position: 'Software Engineer',
        basicSalary: 28000,
        departmentId: departments[0].id,
        roleId: roles[2].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP008',
        firstName: 'Karim',
        lastName: 'Saeed',
        phone: '+20 107 888 9999',
        hireDate: new Date('2023-09-10'),
        status: 'ACTIVE',
        position: 'Junior Developer',
        basicSalary: 15000,
        departmentId: departments[0].id,
        roleId: roles[2].id,
        shiftId: shifts[1].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP009',
        firstName: 'Hana',
        lastName: 'Mostafa',
        phone: '+20 108 999 0000',
        hireDate: new Date('2024-01-05'),
        status: 'ACTIVE',
        position: 'Marketing Manager',
        basicSalary: 24000,
        departmentId: departments[3].id,
        roleId: roles[1].id,
        shiftId: shifts[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeCode: 'EMP010',
        firstName: 'Tarek',
        lastName: 'Nabil',
        phone: '+20 109 000 1111',
        hireDate: new Date('2024-03-20'),
        status: 'TERMINATED',
        position: 'Sales Representative',
        basicSalary: 12000,
        departmentId: departments[4].id,
        roleId: roles[2].id,
        shiftId: shifts[1].id,
        terminationDate: new Date('2024-08-01'),
      },
    }),
  ]);
  console.log(`Created ${employees.length} employees`);

  const leaveTypes = await Promise.all([
    prisma.leaveType.create({
      data: {
        tenantId: tenant.id,
        name: 'Annual Leave',
        defaultDays: 21,
        isPaid: true,
        carriesForward: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        tenantId: tenant.id,
        name: 'Sick Leave',
        defaultDays: 15,
        isPaid: true,
        carriesForward: false,
      },
    }),
    prisma.leaveType.create({
      data: {
        tenantId: tenant.id,
        name: 'Casual Leave',
        defaultDays: 7,
        isPaid: true,
        carriesForward: false,
      },
    }),
    prisma.leaveType.create({
      data: {
        tenantId: tenant.id,
        name: 'Unpaid Leave',
        defaultDays: 30,
        isPaid: false,
        carriesForward: false,
      },
    }),
  ]);
  console.log(`Created ${leaveTypes.length} leave types`);

  const attendanceRecords = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    for (const emp of employees.slice(0, 6)) {
      const clockIn = new Date(dateOnly);
      clockIn.setHours(9, Math.floor(Math.random() * 15), 0, 0);

      const clockOut = new Date(dateOnly);
      clockOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);

      attendanceRecords.push(
        prisma.attendance.create({
          data: {
            tenantId: tenant.id,
            employeeId: emp.id,
            date: dateOnly,
            clockIn,
            clockOut,
            status: Math.random() > 0.1 ? 'PRESENT' : 'LATE',
            minutesLate: Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0,
            overtimeMinutes: Math.random() > 0.9 ? Math.floor(Math.random() * 60) : 0,
          },
        }),
      );
    }
  }
  await Promise.all(attendanceRecords);
  console.log(`Created ${attendanceRecords.length} attendance records`);

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
