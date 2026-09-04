"use client";

import React from "react";
import { Users, UserCheck, CalendarOff, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./kpi-card";
import { useAuth } from "@/features/auth/hooks/use-auth";

const placeholderKpis = [
  { icon: <Users className="h-5 w-5" />, value: "142", label: "Total Employees", trend: 5 },
  { icon: <UserCheck className="h-5 w-5" />, value: "98", label: "Active Today", trend: 12 },
  { icon: <CalendarOff className="h-5 w-5" />, value: "12", label: "Pending Leave", trend: -3 },
  { icon: <DollarSign className="h-5 w-5" />, value: "Oct 2025", label: "Payroll Status" },
];

const placeholderActivity = [
  { id: "1", message: "Ahmed Hassan submitted a leave request", timestamp: "2 hours ago" },
  { id: "2", message: "Payroll for September has been processed", timestamp: "5 hours ago" },
  { id: "3", message: "New employee Sara Ali joined the team", timestamp: "1 day ago" },
  { id: "4", message: "Mohamed attended overtime on Friday", timestamp: "2 days ago" },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back{user?.employee ? `, ${user.employee.firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your organization today.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {placeholderKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
