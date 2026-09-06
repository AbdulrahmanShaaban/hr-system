"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteEmployeesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  employeeName?: string | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function DeleteEmployeesDialog({
  open,
  onOpenChange,
  count,
  employeeName,
  loading = false,
  onConfirm,
}: DeleteEmployeesDialogProps) {
  const isBulk = count > 1;
  const title = isBulk
    ? `حذف ${count} موظفين؟`
    : employeeName
      ? `حذف حساب ${employeeName}؟`
      : "حذف حساب الموظف؟";
  const description = isBulk
    ? "سيتم حذف هؤلاء الموظفين نهائيًا مع سجلات الحضور والإجازات والرواتب المرتبطة بهم. لا يمكن التراجع عن هذا الإجراء."
    : "سيتم حذف هذا الموظف نهائيًا مع سجلات الحضور والإجازات والرواتب المرتبطة به. لا يمكن التراجع عن هذا الإجراء.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ الحذف…
              </span>
            ) : (
              "حذف"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type TerminateEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function TerminateEmployeeDialog({
  open,
  onOpenChange,
  employeeName,
  loading = false,
  onConfirm,
}: TerminateEmployeeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {employeeName
              ? `إنهاء خدمة ${employeeName}؟`
              : "إنهاء خدمة الموظف؟"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            سيتم تعطيل حساب الموظف (غير نشط) مع الإبقاء على سجلات الحضور
            والإجازات والرواتب. يمكنك إعادة تفعيل الحساب لاحقًا.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ الإنهاء…
              </span>
            ) : (
              "إنهاء الخدمة"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
