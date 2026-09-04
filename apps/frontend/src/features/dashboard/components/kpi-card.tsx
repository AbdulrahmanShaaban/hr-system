import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
  className?: string;
}

export function KpiCard({ icon, value, label, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend >= 0 ? "text-success" : "text-danger"
              )}>
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
