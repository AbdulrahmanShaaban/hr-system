"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeTable } from "./employee-table";
import { EmployeeForm } from "./employee-form";
import { useEmployees, useCreateEmployee } from "../hooks/use-employees";
import type { CreateEmployeePayload } from "../types/employee.types";

const placeholderEmployees = [
  { id: "1", firstName: "أحمد", lastName: "حسن", email: "ahmed@qawam.com", position: "مهندس برمجيات", department: "الهندسة", status: "active" as const, joinDate: "2023-01-15" },
  { id: "2", firstName: "سارة", lastName: "علي", email: "sara@qawam.com", position: "مديرة الموارد البشرية", department: "الموارد البشرية", status: "active" as const, joinDate: "2022-06-01" },
  { id: "3", firstName: "محمد", lastName: "خالد", email: "mohamed@qawam.com", position: "محاسب", department: "المالية", status: "on-leave" as const, joinDate: "2023-03-10" },
  { id: "4", firstName: "فاطمة", lastName: "عمر", email: "fatma@qawam.com", position: "مصممة", department: "التصميم", status: "active" as const, joinDate: "2023-08-20" },
  { id: "5", firstName: "يوسف", lastName: "إبراهيم", email: "youssef@qawam.com", position: "مسيّر بنية تحتية", department: "الهندسة", status: "inactive" as const, joinDate: "2021-11-05" },
];

const statusOptions = [
  { value: "all", label: "جميع الحالات" },
  { value: "active", label: "نشط" },
  { value: "on-leave", label: "في إجازة" },
  { value: "inactive", label: "غير نشط" },
];

const departmentOptions = [
  { value: "all", label: "جميع الأقسام" },
  { value: "الهندسة", label: "الهندسة" },
  { value: "الموارد البشرية", label: "الموارد البشرية" },
  { value: "المالية", label: "المالية" },
  { value: "التصميم", label: "التصميم" },
];

function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]!);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const { data } = useEmployees({ search });
  const createEmployee = useCreateEmployee();

  const employees = data?.data || placeholderEmployees;

  const handleCreate = (data: Record<string, string>) => {
    createEmployee.mutate({
      ...data,
      joinDate: new Date().toISOString().split("T")[0],
    } as CreateEmployeePayload);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const posName = typeof e.position === "string" ? e.position : e.position?.name ?? "";
      const matchesSearch = !search ||
        `${e.firstName} ${e.lastName}`.includes(search) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        posName.includes(search);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesDept = departmentFilter === "all" ||
        (typeof e.department === "string" ? e.department : e.department?.name ?? "") === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const handleExport = () => {
    const exportData = filteredEmployees.map((e) => ({
      "الاسم": `${e.firstName} ${e.lastName}`,
      "البريد الإلكتروني": e.email,
      "المسمى الوظيفي": typeof e.position === "string" ? e.position : e.position?.name ?? "",
      "القسم": typeof e.department === "string" ? e.department : e.department?.name ?? "",
      "الحالة": e.status === "active" ? "نشط" : e.status === "on-leave" ? "في إجازة" : "غير نشط",
      "تاريخ الالتحاق": e.joinDate,
    }));
    exportToCSV(exportData, "employees");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الموظفين</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة أعضاء فريق العمل في مؤسستك.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
          <Link href="/employees/new">
            <Button>
              <Plus className="h-4 w-4" />
              إضافة موظف
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>جميع الموظفين ({filteredEmployees.length})</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن موظف..."
                className="ps-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeTable data={filteredEmployees} />
        </CardContent>
      </Card>

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
