"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TablePagination,
  type PageMeta,
} from "@/components/table-pagination";
import { useToast } from "@/components/ui/toaster";
import {
  usePlatformCompanies,
  useSuspendCompany,
  useReactivateCompany,
} from "../hooks/use-platform";
import { CompanyDetailDialog } from "./company-detail-dialog";
import type { PlatformCompany, SubscriptionStatus } from "../types/platform.types";
import { Eye, Power, PowerOff, Search } from "lucide-react";

const STATUS_AR: Record<SubscriptionStatus, string> = {
  TRIAL: "تجربة",
  ACTIVE: "نشط",
  PAST_DUE: "متأخر",
  SUSPENDED: "موقوف",
};

const STATUS_VARIANT: Record<SubscriptionStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  TRIAL: "info",
  ACTIVE: "success",
  PAST_DUE: "warning",
  SUSPENDED: "danger",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA");
}

export function CompaniesPage() {
  const { addToast } = useToast();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [status, setStatus] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [detailCompany, setDetailCompany] = React.useState<PlatformCompany | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, limit]);

  const { data, isLoading } = usePlatformCompanies({
    page,
    limit,
    search: debouncedSearch,
    status,
  });

  const suspendMutation = useSuspendCompany();
  const reactivateMutation = useReactivateCompany();

  const rows = data?.data ?? [];
  const meta: PageMeta | null = data?.meta
    ? {
        page: data.meta.page,
        limit: data.meta.limit,
        itemCount: data.meta.itemCount,
        pageCount: data.meta.pageCount,
        hasPreviousPage: data.meta.hasPreviousPage,
        hasNextPage: data.meta.hasNextPage,
      }
    : rows.length > 0
    ? { page, limit, itemCount: rows.length, pageCount: 1, hasPreviousPage: page > 1, hasNextPage: false }
    : null;

  function handleToggleStatus(company: PlatformCompany) {
    const isSuspended = company.subscriptionStatus === "SUSPENDED";
    const action = isSuspended ? reactivateMutation : suspendMutation;

    action.mutate(company.id, {
      onSuccess: () => {
        addToast({
          title: isSuspended ? "تم إعادة التفعيل" : "تم الإيقاف",
          description: isSuspended
            ? `تم إعادة تفعيل شركة "${company.name}"`
            : `تم إيقاف شركة "${company.name}"`,
          variant: "success",
        });
      },
      onError: (err) => {
        addToast({
          title: "خطأ",
          description: err instanceof Error ? err.message : "تعذر تنفيذ العملية",
          variant: "danger",
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الشركات</h1>
        <p className="text-sm text-muted-foreground">
          كل الشركات المسجّلة: الحالة، الباقة، وعدد الموظفين.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative min-w-0 sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الإيميل..."
            className="h-9 rounded-lg pe-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) setStatus(v);
          }}
        >
          <SelectTrigger className="h-9! w-full rounded-lg sm:w-40">
            <SelectValue>
              {(v: string | null) =>
                !v || v === "ALL"
                  ? "كل الحالات"
                  : (STATUS_AR[v as SubscriptionStatus] ?? v)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحالات</SelectItem>
            <SelectItem value="TRIAL">تجربة</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="PAST_DUE">متأخر</SelectItem>
            <SelectItem value="SUSPENDED">موقوف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">الشركة</TableHead>
              <TableHead>الباقة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>موظفون</TableHead>
              <TableHead>الحسابات</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-3.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-muted-foreground"
                >
                  لا توجد شركات مطابقة
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell className="px-4">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.users[0]?.email ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>{row.plan?.name ?? "بدون باقة"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.subscriptionStatus]}>
                      {STATUS_AR[row.subscriptionStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row._count.employees}
                    {row.plan?.maxEmployees
                      ? ` / ${row.plan.maxEmployees}`
                      : ""}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row._count.users}
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setDetailCompany(row)}
                        aria-label="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleToggleStatus(row)}
                        disabled={suspendMutation.isPending || reactivateMutation.isPending}
                        aria-label={
                          row.subscriptionStatus === "SUSPENDED"
                            ? "إعادة التفعيل"
                            : "إيقاف"
                        }
                      >
                        {row.subscriptionStatus === "SUSPENDED" ? (
                          <Power className="size-4 text-success" />
                        ) : (
                          <PowerOff className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {meta ? (
          <TablePagination
            meta={meta}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>

      <CompanyDetailDialog
        company={detailCompany}
        onOpenChange={(open) => {
          if (!open) setDetailCompany(null);
        }}
      />
    </div>
  );
}
