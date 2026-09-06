"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { EmployeeEditForm } from "@/features/employees/components/employee-edit-form";
import { Button } from "@/components/ui/button";

export default function EmployeeEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/employees" className="hover:text-foreground">
          الموظفين
        </Link>
        <span aria-hidden>/</span>
        {id ? (
          <Link href={`/employees/${id}`} className="hover:text-foreground">
            ملف الموظف
          </Link>
        ) : null}
        <span aria-hidden>/</span>
        <span className="text-foreground">تعديل</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        تعديل بيانات الموظف
      </h1>

      {id ? (
        <EmployeeEditForm employeeId={id} />
      ) : (
        <p className="text-sm text-muted-foreground">معرّف الموظف غير صالح</p>
      )}
    </div>
  );
}
