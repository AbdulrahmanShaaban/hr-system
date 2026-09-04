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
  { id: "1", firstName: "Ahmed", lastName: "Hassan", email: "ahmed@qawam.com", position: "Senior Engineer", department: "Engineering", status: "active" as const, joinDate: "2023-01-15" },
  { id: "2", firstName: "Sara", lastName: "Ali", email: "sara@qawam.com", position: "HR Manager", department: "Human Resources", status: "active" as const, joinDate: "2022-06-01" },
  { id: "3", firstName: "Mohamed", lastName: "Khaled", email: "mohamed@qawam.com", position: "Accountant", department: "Finance", status: "on-leave" as const, joinDate: "2023-03-10" },
  { id: "4", firstName: "Fatma", lastName: "Omar", email: "fatma@qawam.com", position: "Designer", department: "Design", status: "active" as const, joinDate: "2023-08-20" },
  { id: "5", firstName: "Youssef", lastName: "Ibrahim", email: "youssef@qawam.com", position: "DevOps", department: "Engineering", status: "inactive" as const, joinDate: "2021-11-05" },
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
    ? employees.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()) ||
          e.position.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your organization&apos;s team members.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Employees</CardTitle>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9"
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
