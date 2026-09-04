"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
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
import { LeaveForm } from "./leave-form";
import { useLeaveRequests } from "../hooks/use-leave";
import type { LeaveRequest } from "../types/leave.types";

const placeholderRequests: LeaveRequest[] = [
  { id: "1", employeeName: "Ahmed Hassan", leaveType: "Annual Leave", startDate: "2025-11-10", endDate: "2025-11-14", days: 5, reason: "Family vacation", status: "APPROVED" },
  { id: "2", employeeName: "Sara Ali", leaveType: "Sick Leave", startDate: "2025-11-03", endDate: "2025-11-04", days: 2, reason: "Feeling unwell", status: "PENDING" },
  { id: "3", employeeName: "Mohamed Khaled", leaveType: "Annual Leave", startDate: "2025-11-20", endDate: "2025-11-22", days: 3, reason: "Personal matters", status: "REJECTED" },
  { id: "4", employeeName: "Fatma Omar", leaveType: "Maternity Leave", startDate: "2025-12-01", endDate: "2026-03-01", days: 90, reason: "Maternity", status: "PENDING" },
  { id: "5", employeeName: "Youssef Ibrahim", leaveType: "Annual Leave", startDate: "2025-11-05", endDate: "2025-11-05", days: 1, reason: "Day off", status: "CANCELLED" },
];

const statusConfig: Record<string, { variant: "warning" | "success" | "danger" | "default"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "danger", label: "Rejected" },
  CANCELLED: { variant: "default", label: "Cancelled" },
};

export function LeavePage() {
  const [formOpen, setFormOpen] = useState(false);

  const { data } = useLeaveRequests();

  const requests = data?.data || placeholderRequests;

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const totalDaysTaken = requests.filter((r) => r.status === "APPROVED").reduce((acc, r) => acc + r.days, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage employee leave requests and balances.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Days Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalDaysTaken}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const config = statusConfig[request.status];
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.employeeName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell className="text-right">{request.days}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {request.reason}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>
          <LeaveForm
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
