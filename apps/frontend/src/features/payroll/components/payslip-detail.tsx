import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Payslip } from "../types/payroll.types";

const statusVariantMap: Record<Payslip["status"], "default" | "warning" | "success"> = {
  pending: "default",
  processed: "warning",
  paid: "success",
};

interface PayslipDetailProps {
  payslip: Payslip;
}

export function PayslipDetail({ payslip }: PayslipDetailProps) {
  const totalBonuses = payslip.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const totalDeductions = payslip.deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{payslip.employeeName}</CardTitle>
        <Badge variant={statusVariantMap[payslip.status]}>{payslip.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Basic Salary</p>
          <p className="text-lg font-bold text-foreground">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(
              payslip.basicSalary
            )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Bonuses</p>
          <div className="space-y-1">
            {payslip.bonuses.map((bonus, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{bonus.label}</span>
                <span className="text-success font-medium">
                  +{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(bonus.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
              <span className="text-foreground">Total Bonuses</span>
              <span className="text-success">
                +{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(totalBonuses)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Deductions</p>
          <div className="space-y-1">
            {payslip.deductions.map((deduction, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{deduction.label}</span>
                <span className="text-danger font-medium">
                  -{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(deduction.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
              <span className="text-foreground">Total Deductions</span>
              <span className="text-danger">
                -{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Net Pay</span>
          <span className="text-xl font-bold text-foreground">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(
              payslip.netPay
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
