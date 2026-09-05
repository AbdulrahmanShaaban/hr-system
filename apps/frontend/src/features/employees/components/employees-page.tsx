"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function EmployeesPage() {
  const [search, setSearch] = useState("");
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

  const filteredEmployees = search
    ? employees.filter((e) => {
        const posName = typeof e.position === "string" ? e.position : e.position?.name ?? "";
        return (
          `${e.firstName} ${e.lastName}`.includes(search) ||
          e.email.toLowerCase().includes(search.toLowerCase()) ||
          posName.includes(search)
        );
      })
    : employees;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الموظفين</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة أعضاء فريق العمل في مؤسستك.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>جميع الموظفين</CardTitle>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن موظف..."
                className="ps-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
