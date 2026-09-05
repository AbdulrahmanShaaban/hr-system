"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoans, useCreateLoan } from "../hooks/use-loans";
import type { Loan } from "../types/loan.types";

const placeholderLoans: Loan[] = [
  {
    id: "1", employeeName: "أحمد حسن", loanType: "سلفة شخصية", amount: 50000, remaining: 35000,
    monthlyDeduction: 2500, startDate: "2025-06-01", status: "ACTIVE",
    installments: [
      { id: "i1", amount: 2500, dueDate: "2025-07-01", paidDate: "2025-07-01", status: "PAID" },
      { id: "i2", amount: 2500, dueDate: "2025-08-01", paidDate: "2025-08-01", status: "PAID" },
      { id: "i3", amount: 2500, dueDate: "2025-09-01", paidDate: "2025-09-01", status: "PAID" },
      { id: "i4", amount: 2500, dueDate: "2025-10-01", paidDate: "2025-10-01", status: "PAID" },
      { id: "i5", amount: 2500, dueDate: "2025-11-01", paidDate: null, status: "PENDING" },
    ],
  },
  {
    id: "2", employeeName: "سارة علي", loanType: "سلفة راتب", amount: 12000, remaining: 4000,
    monthlyDeduction: 2000, startDate: "2025-08-01", status: "ACTIVE",
    installments: [
      { id: "i6", amount: 2000, dueDate: "2025-09-01", paidDate: "2025-09-01", status: "PAID" },
      { id: "i7", amount: 2000, dueDate: "2025-10-01", paidDate: "2025-10-01", status: "PAID" },
      { id: "i8", amount: 2000, dueDate: "2025-11-01", paidDate: null, status: "PENDING" },
    ],
  },
  {
    id: "3", employeeName: "محمد خالد", loanType: "سلفة شخصية", amount: 20000, remaining: 0,
    monthlyDeduction: 2000, startDate: "2024-12-01", status: "PAID",
    installments: [
      { id: "i9", amount: 2000, dueDate: "2025-01-01", paidDate: "2025-01-01", status: "PAID" },
      { id: "i10", amount: 2000, dueDate: "2025-02-01", paidDate: "2025-02-01", status: "PAID" },
    ],
  },
];

const statusConfig: Record<string, { variant: "info" | "success" | "danger"; label: string }> = {
  ACTIVE: { variant: "info", label: "نشطة" },
  PAID: { variant: "success", label: "مدفوعة" },
  DEFAULTED: { variant: "danger", label: "متأخرة" },
};

const installmentStatusConfig: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  PAID: { variant: "success", label: "مدفوعة" },
  PENDING: { variant: "warning", label: "قيد الانتظار" },
  MISSED: { variant: "danger", label: "فائتة" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(amount);
}

export function LoansPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loanType, setLoanType] = useState("");
  const [amount, setAmount] = useState("");
  const [monthlyDeduction, setMonthlyDeduction] = useState("");

  const { data } = useLoans();
  const createLoan = useCreateLoan();

  const loans = data?.data || placeholderLoans;

  const handleCreate = () => {
    createLoan.mutate(
      {
        employeeId: "current-user",
        loanType,
        amount: parseFloat(amount),
        monthlyDeduction: parseFloat(monthlyDeduction),
      },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">السلف</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة سلف الموظفين وجدول سداد الأقساط.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          طلب سلفة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع السلف</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>الموظف</TableHead>
                <TableHead>نوع السلفة</TableHead>
                <TableHead className="text-end">المبلغ</TableHead>
                <TableHead className="text-end">المتبقي</TableHead>
                <TableHead className="text-end">الخصم الشهري</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const config = statusConfig[loan.status];
                const isExpanded = expandedRow === loan.id;
                return (
                  <React.Fragment key={loan.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleExpand(loan.id)}
                    >
                      <TableCell className="w-8">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{loan.employeeName}</TableCell>
                      <TableCell>{loan.loanType}</TableCell>
                      <TableCell className="text-end font-medium">{formatCurrency(loan.amount)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(loan.remaining)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(loan.monthlyDeduction)}</TableCell>
                      <TableCell>{loan.startDate}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <h4 className="mb-3 text-sm font-semibold text-foreground">جدول الأقساط</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>تاريخ الاستحقاق</TableHead>
                                  <TableHead className="text-end">المبلغ</TableHead>
                                  <TableHead>تاريخ الدفع</TableHead>
                                  <TableHead>الحالة</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {loan.installments.map((inst) => {
                                  const instConfig = installmentStatusConfig[inst.status];
                                  return (
                                    <TableRow key={inst.id}>
                                      <TableCell>{inst.dueDate}</TableCell>
                                      <TableCell className="text-end">{formatCurrency(inst.amount)}</TableCell>
                                      <TableCell>{inst.paidDate || "-"}</TableCell>
                                      <TableCell>
                                        <Badge variant={instConfig.variant}>{instConfig.label}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>طلب سلفة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">نوع السلفة</label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع السلفة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal Loan">سلفة شخصية</SelectItem>
                  <SelectItem value="Advance Salary">سلفة راتب</SelectItem>
                  <SelectItem value="Emergency Loan">سلفة طارئة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              label="مبلغ السلفة"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              type="number"
              label="الخصم الشهري"
              placeholder="0.00"
              value={monthlyDeduction}
              onChange={(e) => setMonthlyDeduction(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!loanType || !amount || !monthlyDeduction || createLoan.isPending}
            >
              {createLoan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
