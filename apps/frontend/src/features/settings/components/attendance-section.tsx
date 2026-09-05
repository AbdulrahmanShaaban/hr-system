"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const WORK_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function AttendanceSection({ onSave }: { onSave: () => void }) {
  const [defaultGraceMinutes, setDefaultGraceMinutes] = useState("15");
  const [autoClockOut, setAutoClockOut] = useState("17:00");
  const [overtimeRate, setOvertimeRate] = useState("1.5");
  const [maxLateMinutes, setMaxLateMinutes] = useState("30");
  const [workDays, setWorkDays] = useState<string[]>(["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"]);

  const toggleWorkDay = (day: string) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الحضور والانصراف</CardTitle>
        <CardDescription>تكوين سياسات الحضور والانصراف.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input type="number" label="فترة السماح (دقائق)" value={defaultGraceMinutes} onChange={(e) => setDefaultGraceMinutes(e.target.value)} />
          <Input type="time" label="وقت الانصراف التلقائي" value={autoClockOut} onChange={(e) => setAutoClockOut(e.target.value)} />
          <Input type="number" label="الحد الأقصى للتأخير (دقائق)" value={maxLateMinutes} onChange={(e) => setMaxLateMinutes(e.target.value)} />
          <Input type="number" label="معدل العمل الإضافي (معامل)" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">أيام العمل</label>
          <div className="flex flex-wrap gap-2">
            {WORK_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleWorkDay(day)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  workDays.includes(day)
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
