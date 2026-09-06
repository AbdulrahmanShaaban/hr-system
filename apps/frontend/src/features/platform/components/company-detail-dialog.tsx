"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlatformCompany } from "../hooks/use-platform";
import type { PlatformCompany, SubscriptionStatus } from "../types/platform.types";

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
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface CompanyDetailDialogProps {
  company: PlatformCompany | null;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailDialog({ company, onOpenChange }: CompanyDetailDialogProps) {
  const { data: detail, isLoading } = usePlatformCompany(company?.id ?? "");

  const info = detail ?? company;

  return (
    <Dialog open={Boolean(company)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تفاصيل الشركة</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : info ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">اسم الشركة</p>
              <p className="font-medium text-foreground">{info.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الباقة</p>
                <p className="font-medium text-foreground">
                  {info.plan?.name ?? "بدون باقة"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant={STATUS_VARIANT[info.subscriptionStatus]}>
                  {STATUS_AR[info.subscriptionStatus]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الموظفون</p>
                <p className="font-medium text-foreground tabular-nums">
                  {info._count.employees}
                  {info.plan?.maxEmployees ? ` / ${info.plan.maxEmployees}` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحسابات</p>
                <p className="font-medium text-foreground tabular-nums">
                  {info._count.users}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
              <p className="font-medium text-foreground">
                {formatDate(info.createdAt)}
              </p>
            </div>

            {info.trialEndsAt && (
              <div>
                <p className="text-sm text-muted-foreground">انتهاء فترة التجربة</p>
                <p className="font-medium text-foreground">
                  {formatDate(info.trialEndsAt)}
                </p>
              </div>
            )}

            {info.nextBillingDate && (
              <div>
                <p className="text-sm text-muted-foreground">الفاتورة القادمة</p>
                <p className="font-medium text-foreground">
                  {formatDate(info.nextBillingDate)}
                </p>
              </div>
            )}

            {info.users.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">المستخدمون</p>
                <div className="space-y-1.5">
                  {info.users.map((u, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{u.email}</span>
                      {u.isPlatformAdmin && (
                        <Badge variant="info" className="text-[10px]">
                          مدير منصة
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
