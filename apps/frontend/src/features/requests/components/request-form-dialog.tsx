"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRequest } from "../hooks/use-requests";
import type { RequestType } from "../types/request.types";

const createSchema = z
  .object({
    type: z.enum(["OVERTIME", "GENERAL"]),
    title: z.string().optional(),
    reason: z.string().optional(),
    date: z.string().optional(),
    hours: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "GENERAL" && !v.title?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "عنوان الطلب مطلوب",
        path: ["title"],
      });
    }
    if (v.type === "OVERTIME") {
      if (!v.date) {
        ctx.addIssue({
          code: "custom",
          message: "التاريخ مطلوب",
          path: ["date"],
        });
      }
      const h = Number(v.hours);
      if (!v.hours || Number.isNaN(h) || h < 0.5) {
        ctx.addIssue({
          code: "custom",
          message: "الساعات مطلوبة (0.5 فأكثر)",
          path: ["hours"],
        });
      }
    }
  });

type CreateValues = z.infer<typeof createSchema>;

interface RequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RequestFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: RequestFormDialogProps) {
  const createMutation = useCreateRequest();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      type: "OVERTIME",
      title: "",
      reason: "",
      date: "",
      hours: "",
    },
  });

  const watchType = form.watch("type");

  React.useEffect(() => {
    if (!open) {
      form.reset({
        type: "OVERTIME",
        title: "",
        reason: "",
        date: "",
        hours: "",
      });
    }
  }, [open, form]);

  function onSubmit(values: CreateValues) {
    createMutation.mutate(
      {
        type: values.type,
        title: values.type === "GENERAL" ? values.title?.trim() : undefined,
        reason: values.reason?.trim() || undefined,
        date: values.type === "OVERTIME" ? values.date : undefined,
        hours:
          values.type === "OVERTIME" ? Number(values.hours) : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب جديد</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label>نوع الطلب</Label>
            <Select
              value={form.getValues("type")}
              onValueChange={(v) => form.setValue("type", v as RequestType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OVERTIME">عمل إضافي</SelectItem>
                <SelectItem value="GENERAL">طلب عام</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {watchType === "GENERAL" && (
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                placeholder="مثال: طلب شهادة خبرة"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          )}

          {watchType === "OVERTIME" && (
            <>
              <div className="space-y-2">
                <Label>تاريخ العمل الإضافي</Label>
                <Input type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>عدد الساعات</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="2"
                  {...form.register("hours")}
                />
                {form.formState.errors.hours && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.hours.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>السبب (اختياري)</Label>
            <Textarea
              placeholder="أضف سبب الطلب..."
              {...form.register("reason")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "إرسال"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
