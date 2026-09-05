"use client";

import React from "react";
import { Users, UserCheck, CalendarOff, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./kpi-card";
import { AttendanceChart, LeavePieChart, PayrollChart } from "./charts";
import { QuickActions } from "./quick-actions";
import { LeaveList } from "./leave-list";
import { useAuth } from "@/features/auth/hooks/use-auth";

const placeholderKpis = [
  { icon: <Users className="h-5 w-5" />, value: "142", label: "إجمالي الموظفين", trend: 5 },
  { icon: <UserCheck className="h-5 w-5" />, value: "98", label: "حاضرين اليوم", trend: 12 },
  { icon: <CalendarOff className="h-5 w-5" />, value: "12", label: "إجازات معلقة", trend: -3 },
  { icon: <DollarSign className="h-5 w-5" />, value: "أكتوبر 2025", label: "حالة الرواتب" },
];

const placeholderActivity = [
  { id: "1", message: "أحمد حسن تقدّم بطلب إجازة", timestamp: "منذ ساعتين" },
  { id: "2", message: "تم معالجة رواتب شهر سبتمبر", timestamp: "منذ 5 ساعات" },
  { id: "3", message: "الموظفة الجديدة سارة علي انضمت للفريق", timestamp: "منذ يوم" },
  { id: "4", message: "محمد سجّل ساعات إضافية يوم الجمعة", timestamp: "منذ يومين" },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          مرحباً بعودتك{user?.employee ? `، ${user.employee.firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          إليك آخر المستجدات في نظامك.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {placeholderKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <AttendanceChart />
            <LeavePieChart />
          </div>
          <PayrollChart />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <LeaveList />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {placeholderActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
