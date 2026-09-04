import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Play } from "lucide-react";
import type { PayrollCycle } from "../types/payroll.types";

const statusVariantMap: Record<PayrollCycle["status"], "default" | "warning" | "success"> = {
  draft: "default",
  processing: "warning",
  completed: "success",
};

interface PayrollCycleCardProps {
  cycle: PayrollCycle;
  onProcess?: (id: string) => void;
}

export function PayrollCycleCard({ cycle, onProcess }: PayrollCycleCardProps) {
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
                  {cycle.month} {cycle.year}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cycle.payslipCount} payslips
                </p>
              </div>
            </div>
          </div>
          <Badge variant={statusVariantMap[cycle.status]}>{cycle.status}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "EGP",
            }).format(cycle.totalAmount)}
          </p>
          {cycle.status === "draft" && onProcess && (
            <Button size="sm" onClick={() => onProcess(cycle.id)}>
              <Play className="h-4 w-4" />
              Process
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
