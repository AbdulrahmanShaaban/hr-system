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

const placeholderShifts = [
  { id: "1", name: "وردية صباحية", startTime: "08:00", endTime: "16:00", graceMinutes: 15 },
  { id: "2", name: "وردية مسائية", startTime: "16:00", endTime: "00:00", graceMinutes: 15 },
  { id: "3", name: "وردية ليلية", startTime: "00:00", endTime: "08:00", graceMinutes: 30 },
];

export function ShiftsSection({ onSave }: { onSave: () => void }) {
  const [shifts, setShifts] = useState(placeholderShifts);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");
  const [newShiftGrace, setNewShiftGrace] = useState("");

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      { id: String(Date.now()), name: newShiftName, startTime: newShiftStart, endTime: newShiftEnd, graceMinutes: parseInt(newShiftGrace) || 0 },
    ]);
    setShiftDialogOpen(false);
    setNewShiftName("");
    setNewShiftStart("");
    setNewShiftEnd("");
    setNewShiftGrace("");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>الورديات</CardTitle>
            <CardDescription>إدارة ورديات العمل والجداول الزمنية.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShiftDialogOpen(true)}>
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
                  <TableHead>وقت البداية</TableHead>
                  <TableHead>وقت النهاية</TableHead>
                  <TableHead className="text-end">فترة السماح (دقيقة)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.startTime}</TableCell>
                    <TableCell>{s.endTime}</TableCell>
                    <TableCell className="text-end">{s.graceMinutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-3">
            {shifts.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{s.name}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm text-foreground">
                        {s.startTime} - {s.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground">سماح: {s.graceMinutes} دقيقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة وردية</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم الوردية" value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="time" label="وقت البداية" value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)} />
              <Input type="time" label="وقت النهاية" value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)} />
            </div>
            <Input type="number" label="فترة السماح (دقائق)" value={newShiftGrace} onChange={(e) => setNewShiftGrace(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddShift} disabled={!newShiftName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
