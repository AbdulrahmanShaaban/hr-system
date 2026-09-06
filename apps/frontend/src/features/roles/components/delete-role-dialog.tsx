"use client";

import * as React from "react";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role, RoleUser } from "../types/role.types";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  users: RoleUser[];
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  users,
  loading,
  onConfirm,
}: DeleteRoleDialogProps) {
  const [typed, setTyped] = React.useState("");
  const label = role?.name ?? "";
  const departments = React.useMemo(() => {
    const names = users
      .map((u) => u.department?.trim())
      .filter((d): d is string => Boolean(d));
    return [...new Set(names)];
  }, [users]);

  React.useEffect(() => {
    if (open) setTyped("");
  }, [open, role?.id]);

  const matches = typed.trim() === label;
  const count = role?.userCount ?? users.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader className="pe-8">
          <DialogTitle className="text-base font-bold">
            حذف دور «{label}»
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangleIcon className="size-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-600">
            حذف دور «{label}»
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            يرجى الانتباه إلى تأثيرات هذا الإجراء على النظام والمستخدمين المعنيين
          </p>
        </div>

        <div className="rounded-xl bg-red-50 px-4 py-3 text-start">
          <p className="text-sm font-bold text-red-600">
            سيتم إزالة هذا الدور من {count} مستخدماً
          </p>
          <p className="mt-1 text-xs leading-5 text-red-700/80">
            سيتم سحب جميع الصلاحيات المرتبطة بهذا الدور فوراً، ولن يتمكن
            الموظفون المتأثرون من اعتماد الحضور أو الإجازات أو الطلبات المرتبطة به.
          </p>
        </div>

        {departments.length > 0 ? (
          <div className="text-start">
            <p className="mb-1.5 text-sm font-medium">الأقسام المتأثرة:</p>
            <ul className="list-disc space-y-1 pe-5 text-sm text-red-600">
              {departments.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-1.5 text-start">
          <Label>
            اكتب اسم الدور للتأكيد
            <span className="text-destructive">*</span>
          </Label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={label}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            disabled={!matches || loading}
            className="h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40"
            onClick={() => void onConfirm()}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "حذف الدور نهائياً"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
