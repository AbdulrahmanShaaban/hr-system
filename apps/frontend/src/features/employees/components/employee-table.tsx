"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { useDeleteEmployee } from "../hooks/use-employees";
import type { Employee } from "../types/employee.types";
import { Eye, Pencil, Trash2 } from "lucide-react";

const statusVariantMap: Record<Employee["status"], "success" | "warning" | "danger"> = {
  active: "success",
  "on-leave": "warning",
  inactive: "danger",
};

const statusLabelMap: Record<Employee["status"], string> = {
  active: "نشط",
  "on-leave": "في إجازة",
  inactive: "غير نشط",
};

function resolveName(value: unknown): string {
  if (!value) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  return String(value);
}

interface EmployeeTableProps {
  data: Employee[];
}

export function EmployeeTable({ data }: EmployeeTableProps) {
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = React.useState<Employee | null>(null);
  const deleteMutation = useDeleteEmployee();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast({ title: "تم بنجاح", description: "تم حذف الموظف" });
        setDeleteTarget(null);
      },
      onError: () => {
        addToast({ title: "خطأ", description: "فشل حذف الموظف", variant: "danger" });
      },
    });
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الموظف</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الالتحاق</TableHead>
              <TableHead className="text-start">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{resolveName(employee.position)}</TableCell>
                  <TableCell>{resolveName(employee.department)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[employee.status]}>
                      {statusLabelMap[employee.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/employees/${employee.id}`}>
                        <Button variant="ghost" size="sm" aria-label="عرض الموظف">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/employees/${employee.id}/edit`}>
                        <Button variant="ghost" size="sm" aria-label="تعديل الموظف">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(employee)} aria-label="حذف الموظف">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  لم يتم العثور على موظفين.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.length > 0 ? (
          data.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{resolveName(employee.position)}</span>
                      <span className="text-border">|</span>
                      <span>{resolveName(employee.department)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={statusVariantMap[employee.status]} className="text-[10px]">
                        {statusLabelMap[employee.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{employee.joinDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/employees/${employee.id}`}>
                      <Button variant="ghost" size="sm" aria-label="عرض الموظف">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/employees/${employee.id}/edit`}>
                      <Button variant="ghost" size="sm" aria-label="تعديل الموظف">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(employee)} aria-label="حذف الموظف">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">لم يتم العثور على موظفين.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الموظف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الموظف{" "}
            <strong>
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </strong>
            ؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
