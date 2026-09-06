"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { TerminateEmployeeDialog } from "@/features/employees/components/delete-dialogs";
import { EmployeeProfileHeader } from "@/features/employees/components/profile-header";
import { TabAttendance } from "@/features/employees/components/tab-attendance";
import { TabEmployment } from "@/features/employees/components/tab-employment";
import { TabLeaves } from "@/features/employees/components/tab-leaves";
import { TabOverview } from "@/features/employees/components/tab-overview";
import { TabSalaries } from "@/features/employees/components/tab-salaries";
import type {
  EmployeeDetail,
  LeaveRow,
  PayrollSlipRow,
} from "@/features/employees/types/employee.types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

const TAB_VALUES = [
  "overview",
  "employment",
  "salaries",
  "attendance",
  "leaves",
] as const;

type TabValue = (typeof TAB_VALUES)[number];

function parseTab(raw: string | null): TabValue {
  if (raw && (TAB_VALUES as readonly string[]).includes(raw)) {
    return raw as TabValue;
  }
  return "overview";
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-full max-w-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params.id;

  const [tab, setTab] = React.useState<TabValue>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [employee, setEmployee] = React.useState<EmployeeDetail | null>(null);
  const [slips, setSlips] = React.useState<PayrollSlipRow[]>([]);
  const [leaves, setLeaves] = React.useState<LeaveRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [slipsLoading, setSlipsLoading] = React.useState(false);
  const [leavesLoading, setLeavesLoading] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [terminateOpen, setTerminateOpen] = React.useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const loadEmployee = useCallback(async () => {
    // Cancel any in-flight requests
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const emp = await api.get<EmployeeDetail>(`/employees/${id}`);
      if (!controller.signal.aborted) {
        setEmployee(emp);

        // Parallel fetch leaves + slips in one go
        const [leavesData, slipsData] = await Promise.allSettled([
          api.get<LeaveRow[]>(`/employees/${id}/leaves`),
          api.get<PayrollSlipRow[]>(`/employees/${id}/payroll-slips`),
        ]);

        if (!controller.signal.aborted) {
          setLeaves(leavesData.status === "fulfilled" ? leavesData.value : []);
          setSlips(slipsData.status === "fulfilled" ? slipsData.value : []);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        addToast({
          title: "خطأ",
          description: err instanceof Error ? err.message : "تعذر تحميل ملف الموظف",
          variant: "danger",
        });
        setEmployee(null);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    loadEmployee();
    return () => abortRef.current?.abort();
  }, [loadEmployee]);

  function setTabAndUrl(next: TabValue) {
    setTab(next);
    const p = new URLSearchParams();
    if (next !== "overview") p.set("tab", next);
    const qs = p.toString();
    router.replace(`/employees/${id}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  async function patchActive(isActive: boolean) {
    if (!employee) return;
    setStatusLoading(true);
    try {
      const updated = await api.patch<EmployeeDetail>(`/employees/${id}`, {
        isActive,
      });
      setEmployee(updated);
      addToast({
        title: isActive ? "تم تفعيل حساب الموظف" : "تم تعطيل حساب الموظف",
        variant: "success",
      });
      setTerminateOpen(false);
    } catch (err) {
      addToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "تعذر تحديث الحالة",
        variant: "danger",
      });
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!employee) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
        <p className="text-muted-foreground">الموظف غير موجود</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/employees")}
        >
          العودة للموظفين
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="flex flex-1 flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            if (typeof v === "string") setTabAndUrl(parseTab(v));
          }}
          className="w-full gap-5"
        >
          <EmployeeProfileHeader
            employee={employee}
            statusLoading={statusLoading}
            onEdit={() => {
              router.push(`/employees/${id}/edit`);
            }}
            onToggleStatus={() => void patchActive(!employee.isActive)}
            onTerminate={() => setTerminateOpen(true)}
            footer={
              <TabsList className="h-auto w-fit justify-start gap-5 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="flex-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  نبذة عامة
                </TabsTrigger>
                <TabsTrigger
                  value="employment"
                  className="flex-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  التوظيف
                </TabsTrigger>
                <TabsTrigger
                  value="salaries"
                  className="flex-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  الرواتب
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="flex-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  الحضور
                </TabsTrigger>
                <TabsTrigger
                  value="leaves"
                  className="flex-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  الإجازات
                </TabsTrigger>
              </TabsList>
            }
          />

          <TabsContent value="overview" className="mt-0">
            <TabOverview
              employee={employee}
              leaves={leaves}
              slips={slips}
            />
          </TabsContent>
          <TabsContent value="employment" className="mt-0">
            <TabEmployment employee={employee} />
          </TabsContent>
          <TabsContent value="salaries" className="mt-0">
            <TabSalaries
              slips={slips}
              loading={slipsLoading}
              salaryBasis={employee.salaryBasis}
            />
          </TabsContent>
          <TabsContent value="attendance" className="mt-0">
            <TabAttendance employeeId={id} />
          </TabsContent>
          <TabsContent value="leaves" className="mt-0">
            <TabLeaves leaves={leaves} loading={leavesLoading} />
          </TabsContent>
        </Tabs>
      </div>

      <TerminateEmployeeDialog
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        employeeName={employee.name}
        loading={statusLoading}
        onConfirm={() => void patchActive(false)}
      />
    </div>
  );
}
