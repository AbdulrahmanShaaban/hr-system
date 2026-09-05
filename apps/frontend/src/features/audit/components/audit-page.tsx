"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionConfig: Record<string, { variant: "success" | "info" | "danger"; label: string }> = {
  CREATE: { variant: "success", label: "إنشاء" },
  UPDATE: { variant: "info", label: "تعديل" },
  DELETE: { variant: "danger", label: "حذف" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { addToast } = useToast();

  const fetchLogs = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await api.get<AuditLogResponse>("/audit", {
        params: { page: String(currentPage), limit: String(limit) },
      });
      setLogs(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      addToast({ title: "خطأ", description: "فشل تحميل سجل التدقيق", variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">سجل التدقيق</h1>
        <p className="mt-1 text-muted-foreground">
          متابعة جميع التغييرات والإجراءات التي تتم في النظام.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع السجلات ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              لا توجد سجلات متاحة
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الإجراء</TableHead>
                      <TableHead>الكيان</TableHead>
                      <TableHead>عنوان IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const config = actionConfig[log.action] ?? { variant: "info" as const, label: log.action };
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">{log.userId}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </TableCell>
                          <TableCell>{log.entity}</TableCell>
                          <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {logs.map((log) => {
                  const config = actionConfig[log.action] ?? { variant: "info" as const, label: log.action };
                  return (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                              <span className="text-xs text-muted-foreground">{log.entity}</span>
                            </div>
                            <p className="mt-1 text-sm text-foreground">{log.userId}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(log.createdAt)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">IP: {log.ipAddress}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 mt-4">
                <span className="text-sm text-muted-foreground">
                  صفحة {page} من {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
