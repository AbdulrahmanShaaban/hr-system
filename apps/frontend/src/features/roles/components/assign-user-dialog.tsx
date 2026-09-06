"use client";

import * as React from "react";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { AssignableUser } from "../types/role.types";

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: AssignableUser[];
  loading?: boolean;
  onAssign: (userId: string) => void | Promise<void>;
}

export function AssignUserDialog({
  open,
  onOpenChange,
  users,
  loading,
  onAssign,
}: AssignUserDialogProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSearch("");
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.fullName ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id));

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  }

  async function handleAssign() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    for (const id of ids) {
      await onAssign(id);
    }
  }

  const hasSelection = selectedIds.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold">تعيين موظفين لهذا الدور</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الإيميل..."
            className="h-10 rounded-lg pe-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            لا يوجد موظفون متاحون للتعيين
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-border/80 px-2 py-2">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleAll}
                aria-label="تحديد الكل"
              />
              <Label className="text-sm text-muted-foreground">
                تحديد الكل ({filtered.length})
              </Label>
            </div>

            <div className="max-h-60 space-y-1 overflow-y-auto">
              {filtered.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-muted/50 has-[:checked]:border-primary/20 has-[:checked]:bg-primary/5"
                >
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                    aria-label={`تحديد ${user.fullName || user.email}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.fullName || user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg"
            disabled={!hasSelection || loading}
            onClick={() => void handleAssign()}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              `تعيين${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
