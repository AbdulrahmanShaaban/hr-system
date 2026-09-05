"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLeaveRequest } from "../hooks/use-leave";

interface LeaveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeaveForm({ onSuccess, onCancel }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const createRequest = useCreateLeaveRequest();

  const handleSubmit = () => {
    createRequest.mutate(
      { leaveType, startDate, endDate, reason },
      { onSuccess }
    );
  };

  const isValid = leaveType && startDate && endDate && reason;

  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">نوع الإجازة</label>
        <Select value={leaveType} onValueChange={setLeaveType}>
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الإجازة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Annual Leave">إجازة سنوية</SelectItem>
            <SelectItem value="Sick Leave">إجازة مرضية</SelectItem>
            <SelectItem value="Personal Leave">إجازة شخصية</SelectItem>
            <SelectItem value="Maternity Leave">إجازة أمومة</SelectItem>
            <SelectItem value="Unpaid Leave">إجازة بدون راتب</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="تاريخ البداية"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          label="تاريخ النهاية"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">السبب</label>
        <Textarea
          placeholder="أدخل سبب الإجازة..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || createRequest.isPending}>
          {createRequest.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          إرسال الطلب
        </Button>
      </div>
    </div>
  );
}
