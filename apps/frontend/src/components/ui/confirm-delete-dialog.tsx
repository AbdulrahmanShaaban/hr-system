"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
  variant?: "destructive" | "default";
}

const ConfirmDeleteDialog = React.forwardRef<
  HTMLDivElement,
  ConfirmDeleteDialogProps
>(
  (
    {
      open,
      onOpenChange,
      title = "Are you sure?",
      description = "This action cannot be undone.",
      confirmText = "Delete",
      cancelText = "Cancel",
      onConfirm,
      children,
      variant = "destructive",
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;

    return (
      <AlertDialogPrimitive.Root
        open={isOpen}
        onOpenChange={setOpen}
      >
        {children && (
          <AlertDialogPrimitive.Trigger asChild>
            {children}
          </AlertDialogPrimitive.Trigger>
        )}
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialogPrimitive.Content
            ref={ref}
            className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          >
            <AlertDialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2">
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="outline">{cancelText}</Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  variant={variant === "destructive" ? "destructive" : "default"}
                  onClick={onConfirm}
                >
                  {confirmText}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    );
  }
);
ConfirmDeleteDialog.displayName = "ConfirmDeleteDialog";

export { ConfirmDeleteDialog };
export type { ConfirmDeleteDialogProps };
