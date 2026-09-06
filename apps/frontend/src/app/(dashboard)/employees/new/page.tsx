"use client";

import Link from "next/link";
import { EmployeeCreateWizard } from "@/features/employees/components/employee-create-wizard";

export default function EmployeeCreatePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/employees" className="hover:text-foreground">
          الموظفين
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">إضافة موظف</span>
      </div>

      <EmployeeCreateWizard />
    </div>
  );
}
