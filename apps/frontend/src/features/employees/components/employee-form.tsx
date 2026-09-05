"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const employeeSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "اسم العائلة مطلوب"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().optional(),
  position: z.string().min(1, "المسمى الوظيفي مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  status: z.enum(["active", "inactive", "on-leave"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => void;
}

export function EmployeeForm({ open, onClose, onSubmit }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: "active" },
  });

  const handleFormSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة موظف</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الاسم الأول"
              placeholder="أحمد"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="اسم العائلة"
              placeholder="حسن"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="ahmed@qawam.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="الهاتف"
            placeholder="+20 123 456 789"
            {...register("phone")}
          />
          <Input
            label="المسمى الوظيفي"
            placeholder="مهندس برمجيات"
            error={errors.position?.message}
            {...register("position")}
          />
          <Input
            label="القسم"
            placeholder="الهندسة"
            error={errors.department?.message}
            {...register("department")}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">الحالة</label>
            <Select
              value={watch("status")}
              onValueChange={(val) => setValue("status", val as EmployeeFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="on-leave">في إجازة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">إنشاء الموظف</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
