"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CircleAlertIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination, type PageMeta } from "@/components/table-pagination";

import { PermissionMatrix } from "@/features/roles/components/permission-matrix";
import {
  RoleFormDialog,
  DeleteRoleDialog,
  ProtectedRoleDialog,
  AssignUserDialog,
  UnassignUsersDialog,
} from "@/features/roles/components/role-dialogs";
import { SiteHeader } from "@/components/layout/site-header";

import {
  useRole,
  useRoleUsers,
  useAllUsers,
  useUpdateRole,
  useDeleteRole,
  useAssignUser,
  useUnassignUsers,
} from "@/features/roles/hooks/use-roles";
import { usePermission, COMPANY_OWNER_ROLE } from "@/hooks/use-permission";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

import {
  PERMISSION_MODULES,
  PERMISSION_COLUMNS,
  allPermissionActions,
  allModuleActions,
  allColumnActions,
  roleLabelAr,
  roleDescriptionAr,
} from "@/features/roles/lib/roles-constants";
import type {
  Role,
  RoleUser,
  AssignableUser,
  PermissionModuleId,
  PermissionActionId,
} from "@/features/roles/types/role.types";

import { cn } from "@/lib/utils";

type TabValue = "permissions" | "users";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "border-transparent bg-primary/10 text-primary"
          : "border-transparent bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {active ? "نشط" : "غير نشط"}
    </Badge>
  );
}

function paginateRows<T>(rows: T[], page: number, limit: number) {
  const itemCount = rows.length;
  const pageCount = Math.ceil(itemCount / limit) || 1;
  const start = (page - 1) * limit;
  const data = rows.slice(start, start + limit);
  const meta: PageMeta = {
    page,
    limit,
    itemCount,
    pageCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
  return { data, meta };
}

function arabicInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase() + name.charAt(1)?.toUpperCase();
}

function formatYmd(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function permissionCountLabel(count: number): string {
  return `${count} صلاحية`;
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}

const tabTriggerClass =
  "h-auto flex-none rounded-none px-1 pb-3 text-sm text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none";

export default function RoleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params.id;
  const { can } = usePermission();
  const canManage = can("roles.manage");

  const [tab, setTab] = React.useState<TabValue>("permissions");
  const [selectedPerms, setSelectedPerms] = React.useState<Set<string>>(
    new Set(),
  );
  const [savedPerms, setSavedPerms] = React.useState<Set<string>>(new Set());

  const { data: roleData, isLoading: roleLoading } = useRole(id);
  const { data: usersData, isLoading: usersLoading } = useRoleUsers(id);
  const { data: allUsersData } = useAllUsers();

  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignUserMutation = useAssignUser();
  const unassignUsersMutation = useUnassignUsers();

  const role: Role | null = roleData ?? null;
  const users: RoleUser[] = Array.isArray(usersData) ? usersData : [];
  const allUsers: AssignableUser[] = Array.isArray(allUsersData) ? allUsersData : [];

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [protectedOpen, setProtectedOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [unassignIds, setUnassignIds] = React.useState<string[]>([]);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(8);
  const { search, setSearch, debouncedSearch } = useDebouncedSearch(300);
  const [department, setDepartment] = React.useState("ALL");
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(
    new Set(),
  );

  React.useEffect(() => {
    if (role) {
      const next = new Set(role.permissions.map((p) => p.permission.code));
      setSelectedPerms(next);
      setSavedPerms(next);
    }
  }, [role]);

  const ownerLocked = role?.name === COMPANY_OWNER_ROLE;
  const canEditPerms = canManage && !ownerLocked;
  const label = role ? roleLabelAr(role.name) : "";
  const permsDirty = !setsEqual(selectedPerms, savedPerms);

  function togglePerm(action: string) {
    if (!canEditPerms) return;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  }

  function selectAllPerms() {
    if (!canEditPerms) return;
    setSelectedPerms(new Set(allPermissionActions()));
  }

  function deselectAllPerms() {
    if (!canEditPerms) return;
    setSelectedPerms(new Set());
  }

  function selectAllModules(moduleIds: PermissionModuleId[]) {
    if (!canEditPerms) return;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const id of moduleIds) {
        for (const action of allModuleActions(id)) {
          next.add(action);
        }
      }
      return next;
    });
  }

  function deselectAllModules(moduleIds: PermissionModuleId[]) {
    if (!canEditPerms) return;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const id of moduleIds) {
        for (const action of allModuleActions(id)) {
          next.delete(action);
        }
      }
      return next;
    });
  }

  function selectAllColumns(actionIds: PermissionActionId[]) {
    if (!canEditPerms) return;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const id of actionIds) {
        for (const action of allColumnActions(id)) {
          next.add(action);
        }
      }
      return next;
    });
  }

  function deselectAllColumns(actionIds: PermissionActionId[]) {
    if (!canEditPerms) return;
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const id of actionIds) {
        for (const action of allColumnActions(id)) {
          next.delete(action);
        }
      }
      return next;
    });
  }

  const moduleSelections = React.useMemo(() => {
    const result: Record<PermissionModuleId, "all" | "none" | "partial"> = {} as Record<PermissionModuleId, "all" | "none" | "partial">;
    for (const mod of PERMISSION_MODULES) {
      const actions = Object.values(mod.cells).filter((a): a is string => Boolean(a));
      if (actions.length === 0) {
        result[mod.id] = "none";
      } else {
        const checked = actions.filter((a) => selectedPerms.has(a)).length;
        if (checked === 0) result[mod.id] = "none";
        else if (checked === actions.length) result[mod.id] = "all";
        else result[mod.id] = "partial";
      }
    }
    return result;
  }, [selectedPerms]);

  const columnSelections = React.useMemo(() => {
    const result: Record<PermissionActionId, "all" | "none" | "partial"> = {} as Record<PermissionActionId, "all" | "none" | "partial">;
    for (const col of PERMISSION_COLUMNS) {
      const actions = allColumnActions(col.key);
      if (actions.length === 0) {
        result[col.key] = "none";
      } else {
        const checked = actions.filter((a) => selectedPerms.has(a)).length;
        if (checked === 0) result[col.key] = "none";
        else if (checked === actions.length) result[col.key] = "all";
        else result[col.key] = "partial";
      }
    }
    return result;
  }, [selectedPerms]);

  async function savePermissions() {
    if (!role || !canEditPerms) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: role.id,
        payload: { permissionActions: Array.from(selectedPerms) },
      });
      const next = new Set(Array.from(selectedPerms));
      setSavedPerms(next);
      addToast({ title: "تم بنجاح", description: "تم حفظ الصلاحيات بنجاح", variant: "success" });
    } catch (err) {
      addToast({ title: "خطأ", description: err instanceof Error ? err.message : "تعذر حفظ الصلاحيات", variant: "danger" });
    }
  }

  async function saveRoleMeta(values: {
    name: string;
    description: string;
    isActive: boolean;
  }) {
    if (!role) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: role.id,
        payload: {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        },
      });
      setFormOpen(false);
      addToast({ title: "تم بنجاح", description: "تم تحديث الدور", variant: "success" });
    } catch (err) {
      addToast({ title: "خطأ", description: err instanceof Error ? err.message : "تعذر تحديث الدور", variant: "danger" });
    }
  }

  function requestDelete() {
    if (!role) return;
    if (role.isSystem) setProtectedOpen(true);
    else setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!role) return;
    try {
      await deleteRoleMutation.mutateAsync(role.id);
      addToast({ title: "تم بنجاح", description: "تم حذف الدور", variant: "success" });
      router.push("/roles");
    } catch (err) {
      addToast({ title: "خطأ", description: err instanceof Error ? err.message : "تعذر حذف الدور", variant: "danger" });
    }
  }

  async function assignUser(userId: string) {
    if (!role) return;
    try {
      await assignUserMutation.mutateAsync({ roleId: role.id, userId });
      addToast({ title: "تم بنجاح", description: "تم تعيين الدور", variant: "success" });
      setAssignOpen(false);
    } catch (err) {
      addToast({ title: "خطأ", description: err instanceof Error ? err.message : "تعذر التعيين", variant: "danger" });
    }
  }

  async function confirmUnassign() {
    if (!role || unassignIds.length === 0) return;
    try {
      await unassignUsersMutation.mutateAsync({
        roleId: role.id,
        userIds: unassignIds,
      });
      addToast({ title: "تم بنجاح", description: "تم حذف الموظفين من الدور", variant: "success" });
      setUnassignIds([]);
      setSelectedUsers(new Set());
    } catch (err) {
      addToast({ title: "خطأ", description: err instanceof Error ? err.message : "تعذر إزالة الموظفين", variant: "danger" });
    }
  }

  React.useEffect(() => {
    setPage(1);
    setSelectedUsers(new Set());
  }, [debouncedSearch, department, limit]);

  const departments = React.useMemo(() => {
    const names = users
      .map((u) => u.department?.trim())
      .filter((d): d is string => Boolean(d));
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "ar"));
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return users.filter((u) => {
      if (department !== "ALL" && (u.department ?? "") !== department) {
        return false;
      }
      if (!q) return true;
      const name = (u.fullName ?? "").toLowerCase();
      const email = u.email.toLowerCase();
      const code = (u.employeeCode ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [users, debouncedSearch, department]);

  const { data: userRows, meta } = React.useMemo(
    () => paginateRows(filteredUsers, page, limit),
    [filteredUsers, page, limit],
  );

  const allSelected =
    userRows.length > 0 && userRows.every((u) => selectedUsers.has(u.id));
  const selectedCount = selectedUsers.size;

  const assignable = allUsers.filter(
    (u) => u.id && !users.some((r) => r.id === u.id),
  );

  const isLoading = roleLoading || usersLoading;

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-muted/30 px-4 py-5 lg:px-6 lg:py-6">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      </>
    );
  }

  if (!role) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <p className="text-muted-foreground">الدور غير موجود</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/roles")}
          >
            العودة للأدوار
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col bg-muted/30">
        <div className="flex flex-1 flex-col px-4 py-5 lg:px-6 lg:py-6">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgb(0,0,0,0.04)]">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                if (typeof v === "string") setTab(v as TabValue);
              }}
              className="gap-0"
            >
              <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {label}
                      </h2>
                      <StatusBadge active={role.isActive} />
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {roleDescriptionAr(role)}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      تاريخ الإنشاء: {formatYmd(role.createdAt)}
                      <span className="mx-2">•</span>
                      آخر تحديث: {formatYmd(role.updatedAt)}
                      <span className="mx-2">•</span>
                      عدد المستخدمين: {role.userCount}
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        className="h-10 gap-2 rounded-lg"
                        onClick={() => setFormOpen(true)}
                      >
                        <SquarePenIcon className="size-4" />
                        تعديل الدور
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={requestDelete}
                      >
                        <Trash2Icon className="size-4" />
                        حذف الدور
                      </Button>
                    </div>
                  ) : null}
                </div>

                <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border/80 bg-transparent p-0">
                  <TabsTrigger value="permissions" className={tabTriggerClass}>
                    الصلاحيات
                  </TabsTrigger>
                  <TabsTrigger value="users" className={tabTriggerClass}>
                    المستخدمون ({role.userCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="permissions" className="mt-0 px-5 py-5 sm:px-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {permsDirty ? (
                    <p className="text-sm font-medium text-orange-500">
                      • يوجد تغييرات غير محفوظة
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      • إجمالي الصلاحيات المفعلة لهذا الدور:{" "}
                      {permissionCountLabel(selectedPerms.size)}
                    </p>
                  )}
                  {canEditPerms ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg border-foreground/20"
                        disabled={updateRoleMutation.isPending}
                        onClick={selectAllPerms}
                      >
                        تحديد الكل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg border-red-400 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={updateRoleMutation.isPending}
                        onClick={deselectAllPerms}
                      >
                        إلغاء تحديد الكل
                      </Button>
                    </div>
                  ) : null}
                </div>

                {updateRoleMutation.isPending ? (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                    <Loader2Icon className="animate-spin" />
                    جاري حفظ الصلاحيات...
                  </div>
                ) : null}

                {permsDirty && canEditPerms && !updateRoleMutation.isPending ? (
                  <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                    <p className="text-sm font-medium text-orange-700">
                      يوجد تغييرات غير محفوظة
                    </p>
                    <p className="mt-1 text-xs text-orange-600/80">
                      اضغط حفظ لتطبيق صلاحيات هذا الدور على المستخدمين المعينين.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="h-8 rounded-lg"
                        disabled={updateRoleMutation.isPending}
                        onClick={() => void savePermissions()}
                      >
                        حفظ التغييرات
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg"
                        disabled={updateRoleMutation.isPending}
                        onClick={() => {
                          setSelectedPerms(new Set(savedPerms));
                        }}
                      >
                        تراجع
                      </Button>
                    </div>
                  </div>
                ) : null}

                {ownerLocked ? (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-sky-700">
                        صلاحيات مدير النظام ثابتة
                      </p>
                      <p className="text-xs text-sky-600/80">
                        لا يمكن تعديل صلاحيات هذا الدور. أنشئ دوراً مخصصاً أو عدّل دوراً آخر.
                      </p>
                    </div>
                  </div>
                ) : null}
                {!canManage && !ownerLocked ? (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-border/80 bg-muted/50 px-4 py-3">
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">عرض فقط</p>
                      <p className="text-xs text-muted-foreground">
                        تحتاج صلاحية إدارة الأدوار لتعديل الصلاحيات.
                      </p>
                    </div>
                  </div>
                ) : null}
                <p className="mb-3 text-xs text-muted-foreground">
                  الخانات التي فيها شرطة غير متاحة لهذه القائمة. اضغط المربع ثم احفظ.
                </p>
                <PermissionMatrix
                  selected={selectedPerms}
                  disabled={!canEditPerms || updateRoleMutation.isPending}
                  onToggle={togglePerm}
                  onSelectAllModules={selectAllModules}
                  onDeselectAllModules={deselectAllModules}
                  onSelectAllColumns={selectAllColumns}
                  onDeselectAllColumns={deselectAllColumns}
                  moduleSelections={moduleSelections}
                  columnSelections={columnSelections}
                />
              </TabsContent>

              <TabsContent value="users" className="mt-0 px-5 py-5 sm:px-6">
                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1 sm:max-w-sm">
                      <SearchIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن طريق الاسم، الرقم الوظيفي..."
                        className="h-9 rounded-lg pe-9"
                      />
                    </div>
                    <Select
                      value={department}
                      onValueChange={(v) => {
                        if (v !== null) setDepartment(v);
                      }}
                    >
                      <SelectTrigger className="h-9! w-full rounded-lg sm:w-44">
                        <SelectValue>
                          {(value: string | null) =>
                            !value || value === "ALL" ? "جميع الأقسام" : value
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">جميع الأقسام</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {canManage ? (
                    <Button
                      type="button"
                      className="h-9 gap-2 rounded-lg"
                      onClick={() => setAssignOpen(true)}
                    >
                      <PlusIcon className="size-4" />
                      تعيين موظف
                    </Button>
                  ) : null}
                </div>

                {canManage && selectedCount > 0 ? (
                  <div className="mb-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-primary">
                      تم تحديد {selectedCount}{" "}
                      {selectedCount === 1 ? "موظف" : "موظفين"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setUnassignIds([...selectedUsers])}
                    >
                      <Trash2Icon className="size-4" />
                      حذف الموظفين من الدور
                    </Button>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-xl border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        {canManage ? (
                          <TableHead className="w-10 pe-0">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(c) => {
                                if (c === true) {
                                  setSelectedUsers(
                                    new Set(userRows.map((u) => u.id)),
                                  );
                                } else {
                                  setSelectedUsers(new Set());
                                }
                              }}
                              aria-label="تحديد الكل"
                            />
                          </TableHead>
                        ) : null}
                        <TableHead>اسم الموظف</TableHead>
                        <TableHead>الرقم الوظيفي</TableHead>
                        <TableHead>القسم</TableHead>
                        <TableHead>تاريخ تعيين الدور</TableHead>
                        {canManage ? (
                          <TableHead className="text-center">إجراءات</TableHead>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={canManage ? 6 : 4}
                            className="h-40 text-center text-muted-foreground"
                          >
                            لا يوجد موظفون معينون لهذا الدور
                          </TableCell>
                        </TableRow>
                      ) : (
                        userRows.map((row) => {
                          const name = row.fullName || row.email;
                          return (
                            <TableRow key={row.id}>
                              {canManage ? (
                                <TableCell className="pe-0">
                                  <Checkbox
                                    checked={selectedUsers.has(row.id)}
                                    onCheckedChange={(c) => {
                                      setSelectedUsers((prev) => {
                                        const next = new Set(prev);
                                        if (c === true) next.add(row.id);
                                        else next.delete(row.id);
                                        return next;
                                      });
                                    }}
                                    aria-label={`تحديد ${name}`}
                                  />
                                </TableCell>
                              ) : null}
                              <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-9 bg-primary/10">
                                    {row.photoUrl ? (
                                      <AvatarImage src={row.photoUrl} alt={name} />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                      {arabicInitials(name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {row.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm tabular-nums">
                                {row.employeeCode ?? "—"}
                              </TableCell>
                              <TableCell>{row.department ?? "—"}</TableCell>
                              <TableCell className="tabular-nums">
                                {formatYmd(row.assignedAt)}
                              </TableCell>
                              {canManage ? (
                                <TableCell>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                                    onClick={() => setUnassignIds([row.id])}
                                  >
                                    <Trash2Icon className="size-4" />
                                    حذف الموظف
                                  </button>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  {meta.itemCount > 0 ? (
                    <TablePagination
                      meta={meta}
                      page={page}
                      limit={limit}
                      shownCount={userRows.length}
                      limitOptions={[8, 10, 20, 50]}
                      showingLabel={(shown, total) =>
                        `نعرض ${shown} من أصل ${total}`
                      }
                      onPageChange={setPage}
                      onLimitChange={(n) => {
                        setLimit(n);
                        setPage(1);
                      }}
                    />
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={role}
        loading={updateRoleMutation.isPending}
        onSubmit={saveRoleMeta}
      />
      <DeleteRoleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={role}
        users={users}
        loading={deleteRoleMutation.isPending}
        onConfirm={confirmDelete}
      />
      <ProtectedRoleDialog
        open={protectedOpen}
        onOpenChange={setProtectedOpen}
        roleName={role.name}
      />
      <AssignUserDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        users={assignable}
        loading={assignUserMutation.isPending}
        onAssign={assignUser}
      />
      <UnassignUsersDialog
        open={unassignIds.length > 0}
        onOpenChange={(open) => {
          if (!open) setUnassignIds([]);
        }}
        count={unassignIds.length}
        loading={unassignUsersMutation.isPending}
        onConfirm={confirmUnassign}
      />
    </>
  );
}
