"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useToast } from "@/components/ui/toaster";
import {
  usePlatformPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "../hooks/use-platform";
import type { PlatformPlan } from "../types/platform.types";

const schema = z.object({
  name: z.string().trim().min(1, "اسم الباقة مطلوب").max(80),
  maxEmployees: z.coerce.number().int().min(1, "حد الموظفين مطلوب"),
  monthlyPrice: z.coerce.number().min(0, "السعر لا يقل عن صفر"),
});

type FormValues = z.infer<typeof schema>;

function money(v: string | number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "—";
}

export function PlansPage() {
  const { addToast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PlatformPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<PlatformPlan | null>(null);

  const { data, isLoading } = usePlatformPlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  const rows: PlatformPlan[] = Array.isArray(data) ? data : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", maxEmployees: 10, monthlyPrice: 0 },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", maxEmployees: 10, monthlyPrice: 0 });
    setDialogOpen(true);
  }

  function openEdit(row: PlatformPlan) {
    setEditing(row);
    form.reset({
      name: row.name,
      maxEmployees: row.maxEmployees,
      monthlyPrice: Number(row.monthlyPrice),
    });
    setDialogOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            addToast({ title: "تم بنجاح", description: "تم تحديث الباقة", variant: "success" });
            setDialogOpen(false);
          },
          onError: (err) => {
            addToast({
              title: "خطأ",
              description: err instanceof Error ? err.message : "تعذر تحديث الباقة",
              variant: "danger",
            });
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          addToast({ title: "تم بنجاح", description: "تم إنشاء الباقة", variant: "success" });
          setDialogOpen(false);
        },
        onError: (err) => {
          addToast({
            title: "خطأ",
            description: err instanceof Error ? err.message : "تعذر إنشاء الباقة",
            variant: "danger",
          });
        },
      });
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast({ title: "تم بنجاح", description: "تم حذف الباقة", variant: "success" });
        setDeleteTarget(null);
      },
      onError: (err) => {
        addToast({
          title: "خطأ",
          description: err instanceof Error ? err.message : "تعذر حذف الباقة",
          variant: "danger",
        });
      },
    });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">خطط الاشتراك</h1>
          <p className="text-sm text-muted-foreground">
            إنشاء وتعديل وحذف باقات المنصة. الشركات تشوف الباقات في صفحة التسعير.
          </p>
        </div>
        <Button type="button" className="shrink-0 gap-2 rounded-lg" onClick={openCreate}>
          <Plus className="size-4" />
          باقة جديدة
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">الاسم</TableHead>
              <TableHead>حد الموظفين</TableHead>
              <TableHead>السعر الشهري</TableHead>
              <TableHead>شركات مشتركة</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-3.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-40 text-center text-muted-foreground"
                >
                  لا توجد باقات. أنشئ باقة للبدء.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell className="px-4 font-medium">
                    <div className="flex items-center gap-2">
                      {row.name}
                      {!row.isActive && (
                        <Badge variant="danger" className="text-[10px]">
                          غير نشطة
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.maxEmployees}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {money(row.monthlyPrice)} ر.س
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row._count?.companies ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(row)}
                        aria-label="تعديل"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setDeleteTarget(row)}
                        aria-label="حذف"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "تعديل الباقة" : "باقة جديدة"}
            </DialogTitle>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : editing ? (
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

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="حذف الباقة"
        description={
          deleteTarget
            ? `هتتمسح باقة "${deleteTarget.name}". لو فيه شركات مشتركة فيها العملية هترفض.`
            : ""
        }
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
