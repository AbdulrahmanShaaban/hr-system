"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PayrollSection({ onSave }: { onSave: () => void }) {
  const [payrollCycle, setPayrollCycle] = useState("monthly");
  const [payoutDay, setPayoutDay] = useState("28");
  const [currency, setCurrency] = useState("EGP");
  const [gosiEmployeeRate, setGosiEmployeeRate] = useState("11");
  const [gosiEmployerRate, setGosiEmployerRate] = useState("12");

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الرواتب</CardTitle>
        <CardDescription>تكوين سياسات الرواتب والمدفوعات.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">دورة الرواتب</label>
            <Select value={payrollCycle} onValueChange={setPayrollCycle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">شهرية</SelectItem>
                <SelectItem value="bi-weekly">نصف شهرية</SelectItem>
                <SelectItem value="weekly">أسبوعية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input type="number" label="يوم الصرف" value={payoutDay} onChange={(e) => setPayoutDay(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">العملة</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EGP">جنيه مصري</SelectItem>
                <SelectItem value="USD">دولار أمريكي</SelectItem>
                <SelectItem value="SAR">ريال سعودي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">التأمينات الاجتماعية (GOSI)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" label="نسبة الموظف (%)" value={gosiEmployeeRate} onChange={(e) => setGosiEmployeeRate(e.target.value)} />
            <Input type="number" label="نسبة صاحب العمل (%)" value={gosiEmployerRate} onChange={(e) => setGosiEmployerRate(e.target.value)} />
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
