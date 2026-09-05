import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InstallmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  async requestLoan(employeeId: string, loanTypeId: string, amount: number) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
    });

    const loanType = await this.prisma.loanType.findUniqueOrThrow({
      where: { id: loanTypeId },
    });

    if (new Decimal(amount).gt(loanType.maxAmount)) {
      throw new BadRequestException(
        `Amount exceeds maximum allowed: ${loanType.maxAmount}`,
      );
    }

    const existingLoan = await this.prisma.loan.findFirst({
      where: { employeeId, status: 'ACTIVE' },
    });
    if (existingLoan) {
      throw new BadRequestException('Employee already has an active loan');
    }

    const months = 12;
    const monthlyDeduction = new Decimal(amount).div(months).toDecimalPlaces(2);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const installments: Array<{
      amount: Decimal;
      dueDate: Date;
      status: string;
    }> = [];

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      dueDate.setHours(0, 0, 0, 0);

      installments.push({
        amount: monthlyDeduction,
        dueDate,
        status: 'PENDING',
      });
    }

    return this.prisma.loan.create({
      data: {
        tenantId: employee.tenantId,
        employeeId,
        loanTypeId,
        amount: new Decimal(amount),
        remaining: new Decimal(amount),
        monthlyDeduction,
        startDate,
        status: 'ACTIVE',
        installments: {
          create: installments.map((inst) => ({
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: inst.status as InstallmentStatus,
          })),
        },
      },
      include: { installments: true, loanType: true },
    });
  }

  async payInstallment(installmentId: string) {
    const installment = await this.prisma.loanInstallment.findUniqueOrThrow({
      where: { id: installmentId },
      include: { loan: true },
    });

    if (installment.status === 'PAID') {
      throw new BadRequestException('Installment is already paid');
    }

    const updated = await this.prisma.loanInstallment.update({
      where: { id: installmentId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });

    const newRemaining = installment.loan.remaining.minus(installment.amount);

    await this.prisma.loan.update({
      where: { id: installment.loanId },
      data: {
        remaining: newRemaining,
        status: newRemaining.lte(0) ? 'PAID' : 'ACTIVE',
      },
    });

    return updated;
  }

  async findActiveByEmployee(employeeId: string) {
    return this.prisma.loan.findFirst({
      where: { employeeId, status: 'ACTIVE' },
      include: { installments: true, loanType: true },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.loan.findMany({
      where: { tenantId },
      include: { employee: true, loanType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllLoanTypes(tenantId: string) {
    return this.prisma.loanType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }
}
