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
  { id: "1", employeeId: "1", employeeName: "Ahmed Hassan", date: "2025-11-01", clockIn: "08:55", clockOut: "17:10", status: "PRESENT", minutesLate: 0, overtimeMinutes: 10, notes: null },
  { id: "2", employeeId: "2", employeeName: "Sara Ali", date: "2025-11-01", clockIn: "09:20", clockOut: "17:30", status: "LATE", minutesLate: 20, overtimeMinutes: 30, notes: null },
  { id: "3", employeeId: "3", employeeName: "Mohamed Khaled", date: "2025-11-01", clockIn: null, clockOut: null, status: "ABSENT", minutesLate: 0, overtimeMinutes: 0, notes: null },
  { id: "4", employeeId: "4", employeeName: "Fatma Omar", date: "2025-11-01", clockIn: "09:00", clockOut: "13:00", status: "HALF_DAY", minutesLate: 0, overtimeMinutes: 0, notes: "Half day" },
  { id: "5", employeeId: "5", employeeName: "Youssef Ibrahim", date: "2025-11-01", clockIn: null, clockOut: null, status: "ON_LEAVE", minutesLate: 0, overtimeMinutes: 0, notes: "Annual leave" },
];

const statusConfig: Record<string, { variant: "success" | "danger" | "warning" | "info" | "default"; label: string }> = {
  PRESENT: { variant: "success", label: "Present" },
  ABSENT: { variant: "danger", label: "Absent" },
  LATE: { variant: "warning", label: "Late" },
  HALF_DAY: { variant: "info", label: "Half Day" },
  ON_LEAVE: { variant: "default", label: "On Leave" },
  HOLIDAY: { variant: "default", label: "Holiday" },
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance</h1>
          <p className="mt-1 text-muted-foreground">
            Track employee attendance and working hours.
          </p>
        </div>
        <ClockInOut />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPresent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{totalAbsent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalLate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalOvertimeHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Attendance Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40"
            />
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="1">Ahmed Hassan</SelectItem>
                <SelectItem value="2">Sara Ali</SelectItem>
                <SelectItem value="3">Mohamed Khaled</SelectItem>
                <SelectItem value="4">Fatma Omar</SelectItem>
                <SelectItem value="5">Youssef Ibrahim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Late</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
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
                    <TableCell className="text-right">
                      {record.minutesLate > 0 ? (
                        <span className="text-danger font-medium">{record.minutesLate}m</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.overtimeMinutes > 0 ? (
                        <span className="text-success font-medium">{record.overtimeMinutes}m</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
