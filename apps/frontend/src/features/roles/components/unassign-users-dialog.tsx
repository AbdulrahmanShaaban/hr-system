"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnassignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function UnassignUsersDialog({
  open,
  onOpenChange,
  count,
  loading,
  onConfirm,
}: UnassignUsersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {count > 1
              ? `حذف ${count} موظفين من الدور؟`
              : "حذف الموظف من الدور؟"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          سيتم نقل {count > 1 ? "هؤلاء الموظفين" : "هذا الموظف"} إلى دور الموظف
          الأساسي وإزالة صلاحيات هذا الدور فوراً.
        </p>
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
            disabled={loading}
            className="h-10 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={() => void onConfirm()}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : count > 1 ? (
              "حذف الموظفين من الدور"
            ) : (
              "حذف الموظف"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
