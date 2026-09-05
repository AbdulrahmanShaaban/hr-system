"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "../types/employee.types";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الموظف</TableHead>
          <TableHead>المسمى الوظيفي</TableHead>
          <TableHead>القسم</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>تاريخ الالتحاق</TableHead>
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
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              لم يتم العثور على موظفين.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
