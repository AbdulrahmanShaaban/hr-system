"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const placeholderLoanTypes = [
  { id: "1", name: "سلفة شخصية", maxAmount: 100000, interestRate: 5 },
  { id: "2", name: "سلفة راتب", maxAmount: 24000, interestRate: 0 },
  { id: "3", name: "سلفة طارئة", maxAmount: 50000, interestRate: 3 },
];

export function LoanTypesSection({ onSave }: { onSave: () => void }) {
  const [loanTypes, setLoanTypes] = useState(placeholderLoanTypes);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [newLoanName, setNewLoanName] = useState("");
  const [newLoanMax, setNewLoanMax] = useState("");
  const [newLoanRate, setNewLoanRate] = useState("");

  const handleAddLoanType = () => {
    setLoanTypes([
      ...loanTypes,
      { id: String(Date.now()), name: newLoanName, maxAmount: parseFloat(newLoanMax) || 0, interestRate: parseFloat(newLoanRate) || 0 },
    ]);
    setLoanDialogOpen(false);
    setNewLoanName("");
    setNewLoanMax("");
    setNewLoanRate("");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>أنواع السلف</CardTitle>
            <CardDescription>إدارة أنواع السلف المتاحة للموظفين.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setLoanDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead className="text-end">الحد الأقصى</TableHead>
                  <TableHead className="text-end">نسبة الفائدة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanTypes.map((lt) => (
                  <TableRow key={lt.id}>
                    <TableCell className="font-medium">{lt.name}</TableCell>
                    <TableCell className="text-end">
                      {lt.maxAmount.toLocaleString("ar-EG")} ج.م
                    </TableCell>
                    <TableCell className="text-end">{lt.interestRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-3">
            {loanTypes.map((lt) => (
              <Card key={lt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{lt.name}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {lt.maxAmount.toLocaleString("ar-EG")} ج.م
                      </p>
                      <p className="text-xs text-muted-foreground">فائدة: {lt.interestRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة نوع سلفة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم نوع السلفة" value={newLoanName} onChange={(e) => setNewLoanName(e.target.value)} />
            <Input type="number" label="الحد الأقصى للمبلغ" value={newLoanMax} onChange={(e) => setNewLoanMax(e.target.value)} />
            <Input type="number" label="نسبة الفائدة (%)" value={newLoanRate} onChange={(e) => setNewLoanRate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddLoanType} disabled={!newLoanName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
