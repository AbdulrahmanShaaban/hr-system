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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toaster";
import { Shield, Plus, Trash2, Key } from "lucide-react";
import {
  useRoles,
  useCreateRole,
  useDeleteRole,
} from "../hooks/use-roles";
import type { Role } from "../types/role.types";

const PERMISSIONS = [
  { group: "الموظفين", items: ["employees.view", "employees.create", "employees.edit", "employees.delete"] },
  { group: "الحضور", items: ["attendance.view", "attendance.mark", "attendance.edit"] },
  { group: "الإجازات", items: ["leave.view", "leave.request", "leave.approve"] },
  { group: "الرواتب", items: ["payroll.view", "payroll.run", "payroll.edit"] },
  { group: "الأقسام", items: ["departments.view", "departments.create", "departments.edit", "departments.delete"] },
  { group: "التقارير", items: ["reports.view", "reports.export"] },
  { group: "الإعدادات", items: ["settings.view", "settings.edit"] },
];

export function RolesPage() {
  const { addToast } = useToast();
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPerms, setSelectedPerms] = React.useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Role | null>(null);
  const [roleName, setRoleName] = React.useState("");

  const { data, isLoading } = useRoles();
  const createMutation = useCreateRole();
  const deleteMutation = useDeleteRole();

  const roles: Role[] = Array.isArray(data?.data) ? data.data as Role[] : Array.isArray(data) ? data as Role[] : [];
  const filtered = roles.filter((r: Role) => r.name.includes(search));

  const togglePerm = (code: string) => {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const handleCreate = () => {
    if (!roleName.trim()) {
      addToast({ title: "خطأ", description: "اسم الدور مطلوب", variant: "danger" });
      return;
    }
    createMutation.mutate(
      { name: roleName, permissionIds: selectedPerms },
      {
        onSuccess: () => {
          addToast({ title: "تم بنجاح", description: "تم إنشاء الدور" });
          setDialogOpen(false);
          setRoleName("");
          setSelectedPerms([]);
        },
        onError: () => {
          addToast({ title: "خطأ", description: "فشل إنشاء الدور", variant: "danger" });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        addToast({ title: "تم بنجاح", description: "تم حذف الدور" });
        setDeleteConfirm(null);
      },
      onError: () => {
        addToast({ title: "خطأ", description: "فشل حذف الدور", variant: "danger" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأدوار والصلاحيات</h1>
          <p className="text-sm text-muted-foreground">إدارة أدوار المستخدمين وصلاحيات الوصول</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="ms-2 h-4 w-4" />
          إضافة دور
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">الأدوار ({filtered.length})</CardTitle>
          <Input
            placeholder="بحث عن دور..."
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
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">لا توجد أدوار</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((role: Role) => (
                <div
                  key={role.id}
                  className="flex flex-col rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role._count?.employees ?? 0} موظف
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.isSystem ? (
                        <Badge>
                          <Key className="ms-1 h-3 w-3" />
                          نظامي
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(role)} aria-label="حذف الدور">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {role.permissions?.slice(0, 5).map((rp) => (
                      <Badge key={rp.permission.code} variant="info" className="text-[10px]">
                        {rp.permission.code}
                      </Badge>
                    ))}
                    {role.permissions?.length > 5 && (
                      <Badge variant="warning" className="text-[10px]">
                        +{role.permissions.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة دور جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">اسم الدور *</label>
              <Input
                placeholder="مثال: مدير الموارد البشرية"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">الصلاحيات</label>
              <div className="space-y-3 max-h-60 overflow-y-auto rounded-lg border border-border p-3">
                {PERMISSIONS.map((group) => (
                  <div key={group.group}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{group.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((code) => (
                        <label
                          key={code}
                          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                            selectedPerms.includes(code)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={selectedPerms.includes(code)}
                            onCheckedChange={() => togglePerm(code)}
                          />
                          {code}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الدور</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف دور <strong>{deleteConfirm?.name}</strong>؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
