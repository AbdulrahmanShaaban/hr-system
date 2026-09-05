"use client";

import React, { useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClockIn, useClockOut } from "../hooks/use-attendance";

export function ClockInOut() {
  const [currentStatus, setCurrentStatus] = useState<"clocked-out" | "clocked-in">("clocked-out");
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const handleClockIn = () => {
    clockIn.mutate("current-user", {
      onSuccess: () => setCurrentStatus("clocked-in"),
    });
  };

  const handleClockOut = () => {
    clockOut.mutate("current-user", {
      onSuccess: () => setCurrentStatus("clocked-out"),
    });
  };

  const isLoading = clockIn.isPending || clockOut.isPending;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        الحالة:{" "}
        <span className={currentStatus === "clocked-in" ? "text-success font-medium" : "text-muted-foreground"}>
          {currentStatus === "clocked-in" ? "تم تسجيل الحضور" : "لم يتم التسجيل بعد"}
        </span>
      </span>
      {currentStatus === "clocked-out" ? (
        <Button onClick={handleClockIn} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          تسجيل حضور
        </Button>
      ) : (
        <Button variant="destructive" onClick={handleClockOut} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          تسجيل انصراف
        </Button>
      )}
    </div>
  );
}
