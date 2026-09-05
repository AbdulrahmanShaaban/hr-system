"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function BenefitsSection({ onSave }: { onSave: () => void }) {
  const [housingAllowance, setHousingAllowance] = useState(false);
  const [housingAmount, setHousingAmount] = useState("");
  const [transportAllowance, setTransportAllowance] = useState(false);
  const [transportAmount, setTransportAmount] = useState("");
  const [annualTickets, setAnnualTickets] = useState(false);
  const [ticketsAmount, setTicketsAmount] = useState("");
  const [medicalInsurance, setMedicalInsurance] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>المزايا والبدلات</CardTitle>
        <CardDescription>إدارة مزايا الموظفين والبدلات.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">بدل السكن</p>
              <p className="text-xs text-muted-foreground">راتب شهري إضافي للسكن</p>
            </div>
            <div className="flex items-center gap-3">
              {housingAllowance && (
                <Input
                  type="number"
                  placeholder="المبلغ"
                  value={housingAmount}
                  onChange={(e) => setHousingAmount(e.target.value)}
                  className="w-32"
                />
              )}
              <Switch checked={housingAllowance} onCheckedChange={setHousingAllowance} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">بدل النقل</p>
              <p className="text-xs text-muted-foreground">راتب شهري إضافي للنقل</p>
            </div>
            <div className="flex items-center gap-3">
              {transportAllowance && (
                <Input
                  type="number"
                  placeholder="المبلغ"
                  value={transportAmount}
                  onChange={(e) => setTransportAmount(e.target.value)}
                  className="w-32"
                />
              )}
              <Switch checked={transportAllowance} onCheckedChange={setTransportAllowance} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">تذاكر الطيران السنوية</p>
              <p className="text-xs text-muted-foreground">تذكرة طيران سنوية للموظفين</p>
            </div>
            <div className="flex items-center gap-3">
              {annualTickets && (
                <Input
                  type="number"
                  placeholder="المبلغ"
                  value={ticketsAmount}
                  onChange={(e) => setTicketsAmount(e.target.value)}
                  className="w-32"
                />
              )}
              <Switch checked={annualTickets} onCheckedChange={setAnnualTickets} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">التأمين الطبي</p>
              <p className="text-xs text-muted-foreground">تغطية تأمين طبي للموظفين</p>
            </div>
            <Switch checked={medicalInsurance} onCheckedChange={setMedicalInsurance} />
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
