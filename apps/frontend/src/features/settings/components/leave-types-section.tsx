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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const placeholderLeaveTypes = [
  { id: "1", name: "إجازة سنوية", defaultDays: 21, isPaid: true },
  { id: "2", name: "إجازة مرضية", defaultDays: 14, isPaid: true },
  { id: "3", name: "إجازة شخصية", defaultDays: 5, isPaid: false },
  { id: "4", name: "إجازة أمومة", defaultDays: 90, isPaid: true },
];

export function LeaveTypesSection({ onSave }: { onSave: () => void }) {
  const [leaveTypes, setLeaveTypes] = useState(placeholderLeaveTypes);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState("");
  const [newLeaveDays, setNewLeaveDays] = useState("");
  const [newLeavePaid, setNewLeavePaid] = useState(true);

  const handleAddLeaveType = () => {
    setLeaveTypes([
      ...leaveTypes,
      { id: String(Date.now()), name: newLeaveName, defaultDays: parseInt(newLeaveDays) || 0, isPaid: newLeavePaid },
    ]);
    setLeaveDialogOpen(false);
    setNewLeaveName("");
    setNewLeaveDays("");
    setNewLeavePaid(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>أنواع الإجازات</CardTitle>
            <CardDescription>إدارة أنواع الإجازات المتاحة للموظفين.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setLeaveDialogOpen(true)}>
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
                  <TableHead className="text-end">الأيام الافتراضية</TableHead>
                  <TableHead>مدفوعة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((lt) => (
                  <TableRow key={lt.id}>
                    <TableCell className="font-medium">{lt.name}</TableCell>
                    <TableCell className="text-end">{lt.defaultDays}</TableCell>
                    <TableCell>
                      <Badge variant={lt.isPaid ? "success" : "default"}>
                        {lt.isPaid ? "مدفوعة" : "غير مدفوعة"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-3">
            {leaveTypes.map((lt) => (
              <Card key={lt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{lt.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{lt.defaultDays} يوم</p>
                    </div>
                    <Badge variant={lt.isPaid ? "success" : "default"} className="text-[10px]">
                      {lt.isPaid ? "مدفوعة" : "غير مدفوعة"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة نوع إجازة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم نوع الإجازة" value={newLeaveName} onChange={(e) => setNewLeaveName(e.target.value)} />
            <Input type="number" label="الأيام الافتراضية" value={newLeaveDays} onChange={(e) => setNewLeaveDays(e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">مدفوعة</label>
              <Select value={newLeavePaid ? "yes" : "no"} onValueChange={(v) => setNewLeavePaid(v === "yes")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">نعم</SelectItem>
                  <SelectItem value="no">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddLeaveType} disabled={!newLeaveName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
