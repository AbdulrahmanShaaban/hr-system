import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Payslip } from "../types/payroll.types";

interface PayslipDetailProps {
  payslip: Payslip;
}

export function PayslipDetail({ payslip }: PayslipDetailProps) {
  const earnings = payslip.components?.filter((c) => c.type === "EARNING") ?? [];
  const deductions = payslip.components?.filter((c) => c.type === "DEDUCTION") ?? [];
  const employeeName = payslip.employee
    ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
    : payslip.employeeId;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{employeeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">الراتب الأساسي</p>
          <p className="text-lg font-bold text-foreground">
            {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(
              payslip.basicSalary
            )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">البدلات</p>
          <div className="space-y-1">
            {earnings.map((comp, i) => (
              <div key={comp.id ?? i} className="flex justify-between text-sm">
                <span className="text-foreground">{comp.name}</span>
                <span className="text-success font-medium">
                  +{new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(comp.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
              <span className="text-foreground">إجمالي البدلات</span>
              <span className="text-success">
                +{new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(payslip.totalEarnings)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">الخصومات</p>
          <div className="space-y-1">
            {deductions.map((comp, i) => (
              <div key={comp.id ?? i} className="flex justify-between text-sm">
                <span className="text-foreground">{comp.name}</span>
                <span className="text-danger font-medium">
                  -{new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(comp.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
              <span className="text-foreground">إجمالي الخصومات</span>
              <span className="text-danger">
                -{new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(payslip.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">صافي الراتب</span>
          <span className="text-xl font-bold text-foreground">
            {new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(
              payslip.netPay
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
