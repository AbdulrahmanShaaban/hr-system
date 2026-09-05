"use client";

import React, { useState } from "react";
import { Plus, Check, X, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data } = useLeaveRequests();

  const requests = data?.data || placeholderRequests;

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const totalDaysTaken = requests.filter((r) => r.status === "APPROVED").reduce((acc, r) => acc + r.days, 0);

  const handleApprove = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setProcessingId(null);
    }, 1000);
  };

  const handleReject = () => {
    if (!rejectDialog) return;
    setProcessingId(rejectDialog);
    setTimeout(() => {
      setProcessingId(null);
      setRejectDialog(null);
      setRejectReason("");
    }, 1000);
  };

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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>طلبات الإجازات</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="PENDING">قيد المراجعة</SelectItem>
              <SelectItem value="APPROVED">معتمدة</SelectItem>
              <SelectItem value="REJECTED">مرفوضة</SelectItem>
              <SelectItem value="CANCELLED">ملغاة</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
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
                  <TableHead className="text-start">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
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
                      <TableCell>
                        {request.status === "PENDING" && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              disabled={processingId === request.id}
                              aria-label="اعتماد"
                            >
                              {processingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRejectDialog(request.id)}
                              disabled={processingId === request.id}
                              aria-label="رفض"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
            {filteredRequests.map((request) => {
              const config = statusConfig[request.status];
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{request.employeeName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{request.leaveType}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            {request.startDate} → {request.endDate}
                          </span>
                          <span className="text-foreground font-medium">{request.days} يوم</span>
                        </div>
                        <div className="mt-2">
                          <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                        </div>
                      </div>
                      {request.status === "PENDING" && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            aria-label="اعتماد"
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectDialog(request.id)}
                            disabled={processingId === request.id}
                            aria-label="رفض"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>رفض طلب الإجازة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="سبب الرفض"
              placeholder="أدخل سبب رفض طلب الإجازة..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || processingId === rejectDialog}
            >
              {processingId === rejectDialog && <Loader2 className="h-4 w-4 animate-spin" />}
              رفض الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
