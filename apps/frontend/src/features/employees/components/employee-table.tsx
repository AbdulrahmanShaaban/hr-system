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

interface EmployeeTableProps {
  data: Employee[];
}

export function EmployeeTable({ data }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Date</TableHead>
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
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <Badge variant={statusVariantMap[employee.status]}>
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>{employee.joinDate}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No employees found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
