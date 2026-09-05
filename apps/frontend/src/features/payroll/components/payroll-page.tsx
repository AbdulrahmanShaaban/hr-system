"use client";

import React, { useState } from "react";
import { Plus, Play, Loader2, DollarSign, Users, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PayrollCycleCard } from "./payroll-cycle-card";
import { usePayrollCycles, useCreateCycle, useProcessCycle } from "../hooks/use-payroll";

const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const placeholderCycles = [
  { id: "1", month: "أكتوبر", year: 2025, status: "completed" as const, payslipCount: 142, totalAmount: 2450000, createdAt: "2025-10-01" },
  { id: "2", month: "سبتمبر", year: 2025, status: "completed" as const, payslipCount: 138, totalAmount: 2380000, createdAt: "2025-09-01" },
  { id: "3", month: "نوفمبر", year: 2025, status: "draft" as const, payslipCount: 0, totalAmount: 0, createdAt: "2025-11-01" },
];

const kpiData = [
  { icon: <DollarSign className="h-5 w-5" />, value: "2,450,000", label: "إجمالي الرواتب", color: "text-success" },
  { icon: <Users className="h-5 w-5" />, value: "142", label: "عدد الموظفين", color: "text-primary" },
  { icon: <TrendingUp className="h-5 w-5" />, value: "1,250,000", label: "صافي الرواتب", color: "text-info" },
  { icon: <Wallet className="h-5 w-5" />, value: "1,200,000", label: "إجمالي الخصومات", color: "text-danger" },
];

export function PayrollPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const { data } = usePayrollCycles();
  const createCycle = useCreateCycle();
  const processCycle = useProcessCycle();

  const cycles = data?.data || placeholderCycles;

  const handleCreate = () => {
    if (!selectedMonth) return;
    createCycle.mutate(
      { month: selectedMonth, year: parseInt(selectedYear) },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الرواتب</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة دورات الرواتب ومعالجة المدفوعات.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          دورة جديدة
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl bg-muted p-2.5 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cycles.map((cycle) => (
          <PayrollCycleCard
            key={cycle.id}
            cycle={cycle}
            onProcess={(id) => processCycle.mutate(id)}
          />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إنشاء دورة رواتب</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">الشهر</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">السنة</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={!selectedMonth || createCycle.isPending}>
              {createCycle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              إنشاء الدورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
