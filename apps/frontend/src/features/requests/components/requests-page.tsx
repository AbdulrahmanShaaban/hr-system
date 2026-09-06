"use client";

import * as React from "react";
import { Loader2Icon, InboxIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination, type PageMeta } from "@/components/table-pagination";
import { usePermission } from "@/hooks/use-permission";
import { useToast } from "@/components/ui/toaster";
import {
  useRequestList,
  useApproveRequest,
  useRejectRequest,
} from "../hooks/use-requests";
import { RequestDetailDialog } from "./request-detail-dialog";
import type { RequestItem, RequestStatus, RequestType } from "../types/request.types";
import {
  STATUS_AR,
  TYPE_AR,
  STATUS_BADGE_VARIANT,
} from "../types/request.types";

export function RequestsPage() {
  const { can, user } = usePermission();
  const { addToast } = useToast();

  const canApprove =
    can(["approvals.manage"]) || Boolean(user?.employee);

  const [status, setStatus] = React.useState<RequestStatus | "ALL">("PENDING");
  const [type, setType] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set()
  );
  const [detailRequest, setDetailRequest] =
    React.useState<RequestItem | null>(null);
  const [bulkActionType, setBulkActionType] = React.useState<
    "approve" | "reject" | null
  >(null);
  const [bulkNote, setBulkNote] = React.useState("");
  const [actingId, setActingId] = React.useState<string | null>(null);

  const { data, isLoading } = useRequestList({
    page,
    limit,
    status: status !== "ALL" ? status : undefined,
    type: type !== "ALL" ? (type as RequestType) : undefined,
    order: "desc",
  });

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const rows = data?.data ?? [];
  const meta: PageMeta = data?.meta ?? {
    page,
    limit,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  React.useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [status, type, limit]);

  function toggleSelectAll() {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkAction() {
    if (!bulkActionType || selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    let successCount = 0;

    for (const id of ids) {
      try {
        if (bulkActionType === "approve") {
          await approveMutation.mutateAsync({ id, reviewNote: bulkNote || undefined });
        } else {
          await rejectMutation.mutateAsync({ id, reviewNote: bulkNote || undefined });
        }
        successCount++;
      } catch {
        // individual failure
      }
    }

    addToast({
      title:
        bulkActionType === "approve"
          ? `تمت الموافقة على ${successCount} طلب`
          : `تم رفض ${successCount} طلب`,
    });

    setSelectedIds(new Set());
    setBulkActionType(null);
    setBulkNote("");
  }

  function getActionableStatus(row: RequestItem): boolean {
    if (!canApprove) return false;
    if (row.status === "PENDING") {
      return true;
    }
    if (row.status === "IN_REVIEW" && user?.employee?.role?.name === "HR") {
      return true;
    }
    return false;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مراجعة طلبات العمل الإضافي والطلبات العامة (مستويان: مدير ثم موارد
          بشرية).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onValueChange={(v) => v && setStatus(v as RequestStatus | "ALL")}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحالات</SelectItem>
            <SelectItem value="PENDING">بانتظار المدير</SelectItem>
            <SelectItem value="IN_REVIEW">بانتظار الموارد البشرية</SelectItem>
            <SelectItem value="APPROVED">موافق عليه</SelectItem>
            <SelectItem value="REJECTED">مرفوض</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={(v) => v && setType(v)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="كل الأنواع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأنواع</SelectItem>
            <SelectItem value="OVERTIME">عمل إضافي</SelectItem>
            <SelectItem value="GENERAL">طلب عام</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ms-auto">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} محدد
            </span>
            <Button
              size="sm"
              variant="default"
              onClick={() => setBulkActionType("approve")}
            >
              <CheckCircle2 className="ms-1 h-4 w-4" />
              موافقة جماعية
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkActionType("reject")}
            >
              <XCircle className="ms-1 h-4 w-4" />
              رفض جماعي
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              {canApprove && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      rows.length > 0 && selectedIds.size === rows.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>الموظف</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: canApprove ? 7 : 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canApprove ? 7 : 6}
                  className="py-16 text-center"
                >
                  <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    لا توجد طلبات في هذا الفلتر
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const actionable = getActionableStatus(row);
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setDetailRequest(row)}
                  >
                    {canApprove && (
                      <TableCell
                        className="w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actionable && (
                          <Checkbox
                            checked={selectedIds.has(row.id)}
                            onCheckedChange={() => toggleSelect(row.id)}
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {row.employeeName || "—"}
                    </TableCell>
                    <TableCell>{TYPE_AR[row.type]}</TableCell>
                    <TableCell>
                      {row.type === "OVERTIME" ? (
                        <span className="text-sm">
                          {row.hours ?? "—"} ساعة
                        </span>
                      ) : (
                        <span className="text-sm">{row.title || "—"}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.date
                        ? new Date(row.date).toLocaleDateString("ar-EG")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_BADGE_VARIANT[row.status as keyof typeof STATUS_BADGE_VARIANT]}
                      >
                        {STATUS_AR[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actionable ? (
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            disabled={actingId === row.id}
                            onClick={() => {
                              setActingId(row.id);
                              approveMutation.mutate(
                                { id: row.id },
                                {
                                  onSettled: () => setActingId(null),
                                }
                              );
                            }}
                          >
                            {actingId === row.id ? (
                              <Loader2Icon className="size-3.5 animate-spin" />
                            ) : (
                              "موافقة"
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={actingId === row.id}
                            onClick={() => {
                              setActingId(row.id);
                              rejectMutation.mutate(
                                { id: row.id, reviewNote: "مرفوض" },
                                {
                                  onSettled: () => setActingId(null),
                                }
                              );
                            }}
                          >
                            رفض
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          meta={meta}
          page={page}
          limit={limit}
          shownCount={rows.length}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      <RequestDetailDialog
        request={detailRequest}
        open={!!detailRequest}
        onOpenChange={(o) => !o && setDetailRequest(null)}
        canApprove={canApprove}
      />

      <Dialog
        open={!!bulkActionType}
        onOpenChange={(o) => {
          if (!o) {
            setBulkActionType(null);
            setBulkNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === "approve"
                ? "الموافقة الجماعية"
                : "الرفض الجماعي"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              سيتم{" "}
              {bulkActionType === "approve" ? "الموافقة على" : "رفض"}{" "}
              {selectedIds.size} طلب.
            </p>
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                placeholder="أضف ملاحظات..."
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkActionType(null);
                setBulkNote("");
              }}
            >
              إلغاء
            </Button>
            <Button
              variant={
                bulkActionType === "approve" ? "default" : "destructive"
              }
              onClick={handleBulkAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {bulkActionType === "approve" ? "تأكيد الموافقة" : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
