"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Role } from "../types/role.types";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  loading?: boolean;
  onSubmit: (values: {
    name: string;
    description: string;
    isActive: boolean;
  }) => void | Promise<void>;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  loading,
  onSubmit,
}: RoleFormDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    if (role) {
      setName(role.name);
      setDescription(role.description ?? "");
      setIsActive(role.isActive);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
    }
  }, [open, role]);

  const nameLocked = Boolean(role?.isLocked || role?.isSystem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {role ? "تعديل الدور" : "إضافة دور جديد"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              اسم الدور
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={nameLocked}
              className="h-10 rounded-lg"
              placeholder="مثال: مشرف الحضور"
            />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 rounded-lg"
              placeholder="وصف مختصر لمسؤوليات هذا الدور"
            />
          </div>
          {role ? (
            <div className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2">
              <Label htmlFor="role-active">الدور نشط</Label>
              <Switch
                id="role-active"
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg"
            disabled={loading || !name.trim()}
            onClick={() =>
              void onSubmit({
                name: name.trim(),
                description: description.trim(),
                isActive,
              })
            }
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : role ? (
              "حفظ التعديلات"
            ) : (
              "إنشاء الدور"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
