import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Play } from "lucide-react";
import type { PayrollCycle } from "../types/payroll.types";

const statusVariantMap: Record<PayrollCycle["status"], "default" | "warning" | "success"> = {
  DRAFT: "default",
  PROCESSING: "warning",
  COMPLETED: "success",
  FINALIZED: "success",
  PAID: "success",
};

const statusLabelMap: Record<PayrollCycle["status"], string> = {
  DRAFT: "مسودة",
  PROCESSING: "قيد المعالجة",
  COMPLETED: "مكتملة",
  FINALIZED: "مؤمّنة",
  PAID: "مدفوعة",
};

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

interface PayrollCycleCardProps {
  cycle: PayrollCycle;
  onProcess?: (id: string) => void;
}

export function PayrollCycleCard({ cycle, onProcess }: PayrollCycleCardProps) {
  const monthName = monthNames[cycle.month - 1] ?? cycle.month;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {monthName} {cycle.year}
                </h3>
              </div>
            </div>
          </div>
          <Badge variant={statusVariantMap[cycle.status]}>{statusLabelMap[cycle.status]}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {cycle.status === "DRAFT" && onProcess && (
            <Button size="sm" onClick={() => onProcess(cycle.id)}>
              <Play className="h-4 w-4" />
              معالجة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
