"use client";

import React, { useState, useEffect } from "react";
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
import { useLeaveTypes, useCreateLeaveRequest } from "../hooks/use-leave";

interface LeaveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeaveForm({ onSuccess, onCancel }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const { data: types, isLoading } = useLeaveTypes();

  useEffect(() => {
    if (!isLoading && types && types.length > 0) {
      const defaultType = types.find((t) => t.name === "Annual Leave") || types[0];
      setLeaveType(defaultType.id);
    }
  }, [isLoading, types]);

  const createRequest = useCreateLeaveRequest();

  const handleSubmit = () => {
    createRequest.mutate(
      { leaveType: leaveType || "", startDate, endDate, reason },
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
            {isLoading ? (
              <SelectItem disabled value="loading">جاري التحميل...</SelectItem>
            ) : types?.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <p className="text-xs text-muted-foreground mt-2">جاري تحميل أنواع الإجازة...</p>
        )}
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
