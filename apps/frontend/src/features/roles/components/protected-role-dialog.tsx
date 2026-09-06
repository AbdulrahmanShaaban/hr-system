"use client";

import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { roleLabelAr } from "../lib/roles-constants";

interface ProtectedRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
}

export function ProtectedRoleDialog({
  open,
  onOpenChange,
  roleName,
}: ProtectedRoleDialogProps) {
  const label = roleLabelAr(roleName);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-sky-100">
            <InfoIcon className="size-7 text-sky-600" />
          </div>
          <h2 className="text-lg font-bold">
            لا يمكن حذف هذا الدور
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            أدوار النظام الأساسية محمية ولا يمكن تعديلها أو إزالتها.
          </p>
        </div>
        <div className="rounded-xl bg-muted/60 px-4 py-3 text-start text-sm leading-6 text-muted-foreground">
          الدور «{label}» هو دور نظام محمي بشكل افتراضي ومطلوب لضمان تشغيل
          الصلاحيات الأساسية للمنشأة. لا يمكن حذفه للحفاظ على سلامة بنية النظام
          الإداري والمالي.
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            إغلاق
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            فهمت ذلك
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
