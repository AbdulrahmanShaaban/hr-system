"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PlatformPlan } from "../types/platform.types";

const schema = z.object({
  name: z.string().trim().min(1, "اسم الباقة مطلوب").max(80),
  maxEmployees: z.coerce.number().int().min(1, "حد الموظفين مطلوب"),
  monthlyPrice: z.coerce.number().min(0, "السعر لا يقل عن صفر"),
});

type FormValues = z.infer<typeof schema>;

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlatformPlan | null;
  onSubmit: (values: FormValues) => void;
  isSaving: boolean;
}

export function PlanFormDialog({
  open,
  onOpenChange,
  plan,
  onSubmit,
  isSaving,
}: PlanFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", maxEmployees: 10, monthlyPrice: 0 },
  });

  React.useEffect(() => {
    if (open) {
      if (plan) {
        form.reset({
          name: plan.name,
          maxEmployees: plan.maxEmployees,
          monthlyPrice: Number(plan.monthlyPrice),
        });
      } else {
        form.reset({ name: "", maxEmployees: 10, monthlyPrice: 0 });
      }
    }
  }, [open, plan, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? "تعديل الباقة" : "باقة جديدة"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    اسم الباقة <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: باقة أساسية" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    حد الموظفين <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    السعر الشهري (ر.س) <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} step={0.01} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : plan ? (
                  "حفظ"
                ) : (
                  "إنشاء"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
