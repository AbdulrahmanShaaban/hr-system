"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClockInOut } from "./clock-in-out";
import { useAttendance } from "../hooks/use-attendance";
import type { AttendanceRecord } from "../types/attendance.types";

const placeholderRecords: AttendanceRecord[] = [
  { id: "1", employeeId: "1", employeeName: "أحمد حسن", date: "2025-11-01", clockIn: "08:55", clockOut: "17:10", status: "PRESENT", minutesLate: 0, overtimeMinutes: 10, notes: null },
  { id: "2", employeeId: "2", employeeName: "سارة علي", date: "2025-11-01", clockIn: "09:20", clockOut: "17:30", status: "LATE", minutesLate: 20, overtimeMinutes: 30, notes: null },
  { id: "3", employeeId: "3", employeeName: "محمد خالد", date: "2025-11-01", clockIn: null, clockOut: null, status: "ABSENT", minutesLate: 0, overtimeMinutes: 0, notes: null },
  { id: "4", employeeId: "4", employeeName: "فاطمة عمر", date: "2025-11-01", clockIn: "09:00", clockOut: "13:00", status: "HALF_DAY", minutesLate: 0, overtimeMinutes: 0, notes: "نصف يوم" },
  { id: "5", employeeId: "5", employeeName: "يوسف إبراهيم", date: "2025-11-01", clockIn: null, clockOut: null, status: "ON_LEAVE", minutesLate: 0, overtimeMinutes: 0, notes: "إجازة سنوية" },
];

const statusConfig: Record<string, { variant: "success" | "danger" | "warning" | "info" | "default"; label: string }> = {
  PRESENT: { variant: "success", label: "حاضر" },
  ABSENT: { variant: "danger", label: "غائب" },
  LATE: { variant: "warning", label: "متأخر" },
  HALF_DAY: { variant: "info", label: "نصف يوم" },
  ON_LEAVE: { variant: "default", label: "في إجازة" },
  HOLIDAY: { variant: "default", label: "عطلة رسمية" },
};

export function AttendancePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const { data } = useAttendance({ startDate, endDate, employeeId: employeeFilter });

  const records = data?.data || placeholderRecords;

  const totalPresent = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const totalAbsent = records.filter((r) => r.status === "ABSENT").length;
  const totalLate = records.filter((r) => r.status === "LATE").length;
  const totalOvertimeHours = records.reduce((acc, r) => acc + r.overtimeMinutes, 0) / 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الحضور والانصراف</h1>
          <p className="mt-1 text-muted-foreground">
            تتبع حضور الموظفين وساعات العمل.
          </p>
        </div>
        <ClockInOut />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الحاضرين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPresent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الغائبين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{totalAbsent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المتأخرين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalLate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ساعات العمل الإضافي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOvertimeHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>سجلات الحضور</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="date"
              placeholder="تاريخ البداية"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40"
            />
            <Input
              type="date"
              placeholder="تاريخ النهاية"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40"
            />
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="جميع الموظفين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                <SelectItem value="1">أحمد حسن</SelectItem>
                <SelectItem value="2">سارة علي</SelectItem>
                <SelectItem value="3">محمد خالد</SelectItem>
                <SelectItem value="4">فاطمة عمر</SelectItem>
                <SelectItem value="5">يوسف إبراهيم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>وقت الحضور</TableHead>
                  <TableHead>وقت الانصراف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-end">التأخير</TableHead>
                  <TableHead className="text-end">العمل الإضافي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const config = statusConfig[record.status];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.clockIn || "-"}</TableCell>
                      <TableCell>{record.clockOut || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        {record.minutesLate > 0 ? (
                          <span className="text-danger font-medium">{record.minutesLate} د</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        {record.overtimeMinutes > 0 ? (
                          <span className="text-success font-medium">{record.overtimeMinutes} د</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {records.map((record) => {
              const config = statusConfig[record.status];
              return (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{record.employeeName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{record.date}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            حضور: <span className="text-foreground font-medium">{record.clockIn || "-"}</span>
                          </span>
                          <span className="text-muted-foreground">
                            انصراف: <span className="text-foreground font-medium">{record.clockOut || "-"}</span>
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                          {record.minutesLate > 0 && (
                            <span className="text-xs text-danger font-medium">تأخير {record.minutesLate} د</span>
                          )}
                          {record.overtimeMinutes > 0 && (
                            <span className="text-xs text-success font-medium">إضافي {record.overtimeMinutes} د</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
