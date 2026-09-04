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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
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
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Ahmed"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last Name"
              placeholder="Hassan"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="ahmed@qawam.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
            placeholder="+20 123 456 789"
            {...register("phone")}
          />
          <Input
            label="Position"
            placeholder="Software Engineer"
            error={errors.position?.message}
            {...register("position")}
          />
          <Input
            label="Department"
            placeholder="Engineering"
            error={errors.department?.message}
            {...register("department")}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select
              value={watch("status")}
              onValueChange={(val) => setValue("status", val as EmployeeFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
