"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangleIcon, Loader2Icon, SaveIcon } from "lucide-react";

import {
  EditErrorDialog,
  EditSuccessDialog,
  RankConfirmDialog,
} from "./edit-dialogs";
import {
  EMPLOYMENT_TYPE_EDIT_AR,
  JOB_RANK_AR,
  SALARY_BASIS_AR,
  WORK_LOCATION_AR,
  annualSalaryFromBasic,
  toE164Sa,
  toLocalPhone,
  type EmployeeDetail,
  type JobRank,
  type WorkLocation,
} from "../types/employee.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

type FormState = {
  name: string;
  phoneLocal: string;
  departmentId: string;
  position: string;
  managerId: string;
  employmentType: EmployeeDetail["employmentType"];
  contractDurationYears: string;
  workLocation: WorkLocation;
  isActive: boolean;
  jobRank: JobRank;
  shiftId: string;
  salaryBasis: EmployeeDetail["salaryBasis"];
  basicSalary: string;
};

function employeeToForm(e: EmployeeDetail): FormState {
  return {
    name: e.name,
    phoneLocal: toLocalPhone(e.phone),
    departmentId: e.departmentId ?? "",
    position: e.position ?? "",
    managerId: e.managerId ?? "",
    employmentType: e.employmentType,
    contractDurationYears:
      e.contractDurationYears != null ? String(e.contractDurationYears) : "",
    workLocation: e.workLocation ?? "HEADQUARTERS",
    isActive: e.isActive,
    jobRank: e.jobRank ?? "EMPLOYEE",
    shiftId: e.shiftId ?? e.shift?.id ?? "",
    salaryBasis: e.salaryBasis,
    basicSalary: String(
      typeof e.basicSalary === "string"
        ? Number(e.basicSalary)
        : e.basicSalary,
    ),
  };
}

function formsEqual(a: FormState, b: FormState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type EmployeeEditFormProps = {
  employeeId: string;
};

export function EmployeeEditForm({ employeeId }: EmployeeEditFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [baseline, setBaseline] = React.useState<FormState | null>(null);

  const [rankOpen, setRankOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [errorOpen, setErrorOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const emp = await api.get<EmployeeDetail>(`/employees/${employeeId}`);
        if (cancelled) return;
        const next = employeeToForm(emp);
        setEmployee(emp);
        setForm(next);
        setBaseline(next);
      } catch {
        if (!cancelled) {
          setEmployee(null);
          setForm(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const dirty = Boolean(form && baseline && !formsEqual(form, baseline));
  const rankChanged = Boolean(
    form && baseline && form.jobRank !== baseline.jobRank,
  );

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function persist() {
    if (!form || !employee) return;
    setSaving(true);
    setRankOpen(false);
    try {
      const years = Number(form.contractDurationYears);
      const basic = Number(form.basicSalary);

      const updated = await api.patch<EmployeeDetail>(
        `/employees/${employee.id}`,
        {
          name: form.name.trim(),
          phone: form.phoneLocal.trim()
            ? toE164Sa(form.phoneLocal)
            : null,
          departmentId: form.departmentId || null,
          position: form.position.trim() || undefined,
          managerId: form.managerId || null,
          employmentType: form.employmentType,
          contractDurationYears:
            form.contractDurationYears.trim() !== "" && Number.isFinite(years)
              ? years
              : null,
          workLocation: form.workLocation,
          isActive: form.isActive,
          jobRank: form.jobRank,
          shiftId: form.shiftId || null,
          salaryBasis: form.salaryBasis,
          basicSalary: Number.isFinite(basic) ? basic : undefined,
        },
      );
      const next = employeeToForm(updated);
      setEmployee(updated);
      setForm(next);
      setBaseline(next);
      setSuccessOpen(true);
    } catch {
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  }

  function requestSave() {
    if (!form || !dirty || saving) return;
    if (rankChanged) {
      setRankOpen(true);
      return;
    }
    void persist();
  }

  if (loading || !form || !employee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-128 w-full rounded-2xl" />
      </div>
    );
  }

  const annual = annualSalaryFromBasic(form.basicSalary, form.salaryBasis);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
        <section className="space-y-4 border-b border-border/70 p-5 sm:p-6">
          <h2 className="text-base font-bold sm:text-lg">
            المعلومات الأساسية
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل">
              <Input
                value={form.name}
                onChange={(e) => patchForm("name", e.target.value)}
                className="h-10 rounded-lg"
              />
            </Field>
            <Field label="البريد الإلكتروني للعمل">
              <Input
                value={employee.email ?? ""}
                disabled
                className="h-10 rounded-lg bg-muted/40"
              />
            </Field>
            <Field label="رقم الهاتف">
              <Input
                value={form.phoneLocal}
                onChange={(e) => patchForm("phoneLocal", e.target.value)}
                placeholder="5X XXX XXXX"
                dir="ltr"
                className="h-10 rounded-lg"
              />
            </Field>
            <Field label="رقم الموظف">
              <Input
                value={employee.employeeCode}
                disabled
                className="h-10 rounded-lg bg-muted/40"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4 border-b border-border/70 p-5 sm:p-6">
          <h2 className="text-base font-bold sm:text-lg">
            تفاصيل التوظيف
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="القسم">
              <Input
                value={employee.department ?? ""}
                disabled
                className="h-10 rounded-lg bg-muted/40"
              />
            </Field>
            <Field label="المسمى الوظيفي">
              <Input
                value={form.position}
                onChange={(e) => patchForm("position", e.target.value)}
                className="h-10 rounded-lg"
              />
            </Field>
            <Field label="المدير المباشر">
              <Input
                value={employee.managerName ?? ""}
                disabled
                className="h-10 rounded-lg bg-muted/40"
              />
            </Field>
            <Field label="نوع العقد">
              <Select
                value={form.employmentType}
                onValueChange={(v) => {
                  if (v)
                    patchForm(
                      "employmentType",
                      v as EmployeeDetail["employmentType"],
                    );
                }}
              >
                <SelectTrigger className="h-10! w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_EDIT_AR).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="مدة العقد (بالسنين)">
              <Input
                type="number"
                min={0}
                step={0.5}
                value={form.contractDurationYears}
                onChange={(e) =>
                  patchForm("contractDurationYears", e.target.value)
                }
                className="h-10 rounded-lg"
                dir="ltr"
              />
            </Field>
            <Field label="مكان العمل">
              <Select
                value={form.workLocation}
                onValueChange={(v) => {
                  if (v) patchForm("workLocation", v as WorkLocation);
                }}
              >
                <SelectTrigger className="h-10! w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(WORK_LOCATION_AR) as WorkLocation[]).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {WORK_LOCATION_AR[k]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field label="الحالة الوظيفية">
              <Select
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onValueChange={(v) => {
                  if (v) patchForm("isActive", v === "ACTIVE");
                }}
              >
                <SelectTrigger className="h-10! w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">نشط</SelectItem>
                  <SelectItem value="INACTIVE">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="الوردية">
              <Input
                value={employee.shift?.name ?? ""}
                disabled
                className="h-10 rounded-lg bg-muted/40"
              />
            </Field>
            <Field label="الرتبة الوظيفية" className="sm:col-span-2">
              <Select
                value={form.jobRank}
                onValueChange={(v) => {
                  if (v) patchForm("jobRank", v as JobRank);
                }}
              >
                <SelectTrigger className="h-10! w-full max-w-md rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(JOB_RANK_AR) as JobRank[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {JOB_RANK_AR[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-800">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <p className="leading-relaxed">
                  يرجى الانتباه، تغيير الرتبة الوظيفية سيسجل كترقية للموظف، وسيتم
                  تحديث صلاحياته داخل النظام وفقاً للرتبة الجديدة.
                </p>
              </div>
            </Field>
          </div>
        </section>

        <section className="space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-bold sm:text-lg">
            الرواتب
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نوع الراتب">
              <Select
                value={form.salaryBasis}
                onValueChange={(v) => {
                  if (v)
                    patchForm(
                      "salaryBasis",
                      v as EmployeeDetail["salaryBasis"],
                    );
                }}
              >
                <SelectTrigger className="h-10! w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SALARY_BASIS_AR).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="الراتب الأساسي (شهري)">
              <Input
                type="number"
                min={0}
                step={100}
                value={form.basicSalary}
                onChange={(e) => patchForm("basicSalary", e.target.value)}
                className="h-10 rounded-lg"
                dir="ltr"
              />
            </Field>
            <Field label="الراتب (سنوي)">
              <Input
                value={annual.toLocaleString("en-US")}
                disabled
                className="h-10 rounded-lg bg-muted/40"
                dir="ltr"
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                dirty ? "bg-orange-500" : "bg-primary",
              )}
            />
            <span
              className={cn(
                dirty ? "text-muted-foreground" : "text-primary",
              )}
            >
              {dirty
                ? "لديك تعديلات غير محفوظة"
                : "جميع التعديلات محفوظة"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={saving}
              onClick={() => router.push(`/employees/${employeeId}`)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              className="gap-2 rounded-lg"
              disabled={!dirty || saving || !form.name.trim()}
              onClick={requestSave}
            >
              {saving ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              حفظ التعديلات
            </Button>
          </div>
        </div>
      </div>

      <RankConfirmDialog
        open={rankOpen}
        onOpenChange={setRankOpen}
        loading={saving}
        onConfirm={() => void persist()}
      />
      <EditSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        onBackToProfile={() => {
          setSuccessOpen(false);
          router.push(`/employees/${employeeId}`);
        }}
      />
      <EditErrorDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        onRetry={() => {
          setErrorOpen(false);
        }}
      />
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
