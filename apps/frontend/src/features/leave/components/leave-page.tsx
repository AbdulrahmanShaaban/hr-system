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
  { id: "1", employeeName: "أحمد حسن", leaveType: "إجازة سنوية", startDate: "2025-11-10", endDate: "2025-11-14", days: 5, reason: "سفر عائلي", status: "APPROVED" },
  { id: "2", employeeName: "سارة علي", leaveType: "إجازة مرضية", startDate: "2025-11-03", endDate: "2025-11-04", days: 2, reason: "شعور بعدم الارتياح", status: "PENDING" },
  { id: "3", employeeName: "محمد خالد", leaveType: "إجازة سنوية", startDate: "2025-11-20", endDate: "2025-11-22", days: 3, reason: "أمور شخصية", status: "REJECTED" },
  { id: "4", employeeName: "فاطمة عمر", leaveType: "إجازة أمومة", startDate: "2025-12-01", endDate: "2026-03-01", days: 90, reason: "إجازة أمومة", status: "PENDING" },
  { id: "5", employeeName: "يوسف إبراهيم", leaveType: "إجازة سنوية", startDate: "2025-11-05", endDate: "2025-11-05", days: 1, reason: "يوم راحة", status: "CANCELLED" },
];

const statusConfig: Record<string, { variant: "warning" | "success" | "danger" | "default"; label: string }> = {
  PENDING: { variant: "warning", label: "قيد المراجعة" },
  APPROVED: { variant: "success", label: "معتمدة" },
  REJECTED: { variant: "danger", label: "مرفوضة" },
  CANCELLED: { variant: "default", label: "ملغاة" },
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">إدارة الإجازات</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة طلبات إجازات الموظفين والأرصدة.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          طلب إجازة
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">طلبات معلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المعتمدة هذا الشهر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الأيام المأخوذة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalDaysTaken}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>نوع الإجازة</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>تاريخ النهاية</TableHead>
                <TableHead className="text-end">الأيام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>السبب</TableHead>
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
                    <TableCell className="text-end">{request.days}</TableCell>
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
            <DialogTitle>طلب إجازة</DialogTitle>
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
