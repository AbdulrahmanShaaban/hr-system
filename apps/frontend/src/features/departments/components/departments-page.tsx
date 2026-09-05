"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../hooks/use-departments";
import type { Department, CreateDepartmentPayload } from "../types/department.types";

export function DepartmentsPage() {
  const { addToast } = useToast();
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Department | null>(null);
  const [form, setForm] = React.useState<CreateDepartmentPayload>({ name: "", parentId: null });

  const { data, isLoading } = useDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const departments = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? (data as any[]) : [];

  const filtered = departments.filter((d: Department) =>
    d.name.includes(search)
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", parentId: null });
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, parentId: dept.parentId });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast({ title: "خطأ", description: "اسم القسم مطلوب", variant: "danger" });
      return;
    }

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: form },
        {
          onSuccess: () => {
            addToast({ title: "تم بنجاح", description: "تم تحديث القسم" });
            setDialogOpen(false);
          },
          onError: () => {
            addToast({ title: "خطأ", description: "فشل تحديث القسم", variant: "danger" });
          },
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          addToast({ title: "تم بنجاح", description: "تم إضافة القسم" });
          setDialogOpen(false);
        },
        onError: () => {
          addToast({ title: "خطأ", description: "فشل إضافة القسم", variant: "danger" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        addToast({ title: "تم بنجاح", description: "تم حذف القسم" });
        setDeleteConfirm(null);
      },
      onError: () => {
        addToast({ title: "خطأ", description: "فشل حذف القسم", variant: "danger" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأقسام</h1>
          <p className="text-sm text-muted-foreground">إدارة أقسام المؤسسة والهيكل التنظيمي</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="ms-2 h-4 w-4" />
          إضافة قسم
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">جميع الأقسام ({filtered.length})</CardTitle>
          <Input
            placeholder="بحث عن قسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">لا توجد أقسام</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-end">
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">القسم</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">القسم الأب</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">عدد الموظفين</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((dept: Department) => (
                    <tr key={dept.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm font-medium text-foreground">{dept.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {dept.parent?.name || "—"}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        <Badge>{dept._count?.employees ?? 0}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(dept)} aria-label="تعديل القسم">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(dept)} aria-label="حذف القسم">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">اسم القسم *</label>
              <Input
                placeholder="مثال: قسم المحاسبة"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">القسم الأب</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm dark:bg-muted"
                value={form.parentId || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parentId: e.target.value || null }))
                }
              >
                <option value="">بدون (قسم رئيسي)</option>
                {departments
                  .filter((d: Department) => d.id !== editing?.id)
                  .map((d: Department) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف القسم</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف قسم <strong>{deleteConfirm?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
