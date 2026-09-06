"use client";

import * as React from "react";
import { PlusIcon, InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination, type PageMeta } from "@/components/table-pagination";
import { useToast } from "@/components/ui/toaster";
import {
  useMyRequests,
  useCancelRequest,
} from "../hooks/use-requests";
import { RequestFormDialog } from "./request-form-dialog";
import { RequestDetailDialog } from "./request-detail-dialog";
import type { RequestItem, RequestStatus } from "../types/request.types";
import {
  STATUS_AR,
  TYPE_AR,
  STATUS_BADGE_VARIANT,
} from "../types/request.types";

export function MyRequestsPage() {
  const { addToast } = useToast();

  const [status, setStatus] = React.useState<RequestStatus | "ALL">("ALL");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [detailRequest, setDetailRequest] =
    React.useState<RequestItem | null>(null);
  const [cancelTarget, setCancelTarget] =
    React.useState<RequestItem | null>(null);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const cancelMutation = useCancelRequest();

  const { data, isLoading } = useMyRequests({
    page,
    limit,
    status: status !== "ALL" ? status : undefined,
    order: "desc",
  });

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
  }, [status, limit]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setActingId(cancelTarget.id);
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => {
        addToast({ title: "تم إلغاء الطلب" });
        setCancelTarget(null);
      },
      onError: (err) => {
        addToast({
          title: err instanceof Error ? err.message : "تعذر الإلغاء",
          variant: "danger",
        });
      },
      onSettled: () => setActingId(null),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
          <p className="text-sm text-muted-foreground mt-1">
            قدّم طلب عمل إضافي أو طلباً عاماً وتابع حالة الموافقة.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          طلب جديد
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={status}
          onValueChange={(v) => v && setStatus(v as RequestStatus | "ALL")}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحالات</SelectItem>
            {Object.entries(STATUS_AR).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead>النوع</TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>المستوى</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-16 text-center"
                >
                  <InboxIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    لا توجد طلبات بعد
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setDetailRequest(row)}
                >
                  <TableCell className="font-medium">
                    {TYPE_AR[row.type]}
                  </TableCell>
                  <TableCell>
                    {row.type === "OVERTIME" ? (
                      <span className="text-sm">
                        {row.date || "—"} · {row.hours ?? "—"} ساعة
                      </span>
                    ) : (
                      <span className="text-sm">{row.title || "—"}</span>
                    )}
                    {row.reason && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.reason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_BADGE_VARIANT[row.status as keyof typeof STATUS_BADGE_VARIANT]}
                    >
                      {STATUS_AR[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.approvalLevel}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {row.status === "PENDING" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={actingId === row.id}
                        onClick={() => setCancelTarget(row)}
                      >
                        إلغاء
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
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

      <RequestFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <RequestDetailDialog
        request={detailRequest}
        open={!!detailRequest}
        onOpenChange={(o) => !o && setDetailRequest(null)}
        canApprove={false}
      />

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء الطلب؟</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            سيتم إلغاء الطلب المعلّق ولن يمكن استرجاعه.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={Boolean(actingId)}
            >
              إلغاء الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


