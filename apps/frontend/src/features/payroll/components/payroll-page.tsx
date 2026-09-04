"use client";

import React, { useState } from "react";
import { Plus, Play, Loader2 } from "lucide-react";
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
import { PayrollCycleCard } from "./payroll-cycle-card";
import { usePayrollCycles, useCreateCycle, useProcessCycle } from "../hooks/use-payroll";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const placeholderCycles = [
  { id: "1", month: "October", year: 2025, status: "completed" as const, payslipCount: 142, totalAmount: 2450000, createdAt: "2025-10-01" },
  { id: "2", month: "September", year: 2025, status: "completed" as const, payslipCount: 138, totalAmount: 2380000, createdAt: "2025-09-01" },
  { id: "3", month: "November", year: 2025, status: "draft" as const, payslipCount: 0, totalAmount: 0, createdAt: "2025-11-01" },
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payroll</h1>
          <p className="mt-1 text-muted-foreground">
            Manage payroll cycles and process payments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Cycle
        </Button>
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
            <DialogTitle>Create Payroll Cycle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
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
              <label className="text-sm font-medium text-foreground">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
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
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!selectedMonth || createCycle.isPending}>
              {createCycle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
