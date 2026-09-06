"use client";

import React from "react";
import { CheckIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type CreateSuccessDialogProps = {
  open: boolean;
  employeeId: string | null;
  onOpenChange: (open: boolean) => void;
  onAddAnother: () => void;
};

export function CreateSuccessDialog({
  open,
  employeeId,
  onOpenChange,
  onAddAnother,
}: CreateSuccessDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg gap-5 rounded-2xl p-6 sm:max-w-lg">
        <AlertDialogHeader className="start gap-3 text-start">
          <div className="flex w-full items-start gap-3">
            <div className="mb-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <AlertDialogTitle className="text-base font-bold leading-snug sm:text-lg">
                تم إنشاء حساب الموظف بنجاح
              </AlertDialogTitle>
              <AlertDialogDescription className="start text-sm leading-relaxed text-muted-foreground">
                يمكنك الآن عرض ملف الموظف، أو إضافة موظف جديد، أو العودة إلى
                قائمة الموظفين.
              </AlertDialogDescription>
            </div>
          </div>
          {employeeId ? (
            <Link
              href={`/employees/${employeeId}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              عرض حساب الموظف
              <span aria-hidden className="text-base leading-none">
                ›
              </span>
            </Link>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="!mx-0 !mb-0 grid !grid-cols-2 gap-3 border-t border-border/60 !bg-transparent pt-4 sm:flex-row">
          <Link href="/employees" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-primary text-primary hover:bg-primary/5 hover:text-primary"
            >
              قائمة الموظفين
            </Button>
          </Link>
          <Button
            type="button"
            className="h-11 w-full gap-1.5 rounded-lg"
            onClick={onAddAnother}
          >
            <PlusIcon className="h-4 w-4" />
            إضافة موظف جديد
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
