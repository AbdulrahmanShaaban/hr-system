"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const attendanceData = [
  { name: "السبت", حاضرون: 120, غياب: 15 },
  { name: "الأحد", حاضرون: 125, غياب: 10 },
  { name: "الاثنين", حاضرون: 118, غياب: 17 },
  { name: "الثلاثاء", حاضرون: 130, غياب: 5 },
  { name: "الأربعاء", حاضرون: 128, غياب: 7 },
  { name: "الخميس", حاضرون: 122, غياب: 13 },
];

const leaveData = [
  { name: "إجازة مرضية", value: 8, color: "#ef4444" },
  { name: "إجازة سنوية", value: 15, color: "#3b82f6" },
  { name: "إجازة عارضة", value: 5, color: "#f59e0b" },
  { name: "إجازة بدون راتب", value: 3, color: "#8b5cf6" },
];

const payrollData = [
  { name: "يناير", الصافي: 850000, الخصومات: 120000 },
  { name: "فبراير", الصافي: 870000, الخصومات: 115000 },
  { name: "مارس", الصافي: 860000, الخصومات: 118000 },
  { name: "أبريل", الصافي: 890000, الخصومات: 110000 },
  { name: "مايو", الصافي: 910000, الخصومات: 105000 },
  { name: "يونيو", الصافي: 900000, الخصومات: 108000 },
];

export function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">إحصائيات الحضور الأسبوعية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  direction: "rtl",
                }}
              />
              <Legend />
              <Bar dataKey="حاضرون" fill="var(--color-primary-start)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeavePieChart() {
  const total = leaveData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">توزيع الإجازات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leaveData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {leaveData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  direction: "rtl",
                }}
                formatter={(value: any) => [`${value} طلب (${((value / total) * 100).toFixed(0)}%)`, ""]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PayrollChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ملخص الرواتب (يونيو - أغسطس 2026)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  direction: "rtl",
                }}
                formatter={(value: any) => [
                  new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(value),
                  "",
                ]}
              />
              <Legend />
              <Bar dataKey="الصافي" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="الخصومات" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
