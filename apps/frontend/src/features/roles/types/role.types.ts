export type PermissionModuleId =
  | "employees"
  | "departments"
  | "attendance"
  | "leave"
  | "loans"
  | "payroll"
  | "salary-components"
  | "roles"
  | "documents"
  | "reports"
  | "approvals"
  | "notifications"
  | "settings"
  | "onboarding";

export type PermissionActionId =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "bulk-actions";

export interface PermissionModule {
  id: PermissionModuleId;
  label: string;
  cells: Partial<Record<PermissionActionId, string>>;
}

export interface PermissionColumn {
  key: PermissionActionId;
  label: string;
}

export type PermissionMatrix = Set<string>;

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  isLocked?: boolean;
  isActive: boolean;
  permissions: { permission: { id: string; name: string; code: string } }[];
  _count?: { employees: number };
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleUser {
  id: string;
  email: string;
  fullName: string | null;
  employeeCode?: string | null;
  department?: string | null;
  photoUrl?: string | null;
  assignedAt: string;
  roleName?: string;
}

export interface AssignableUser {
  id: string;
  email: string;
  fullName: string | null;
  roleName: string;
}

export type CreateRolePayload = {
  name: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
};

export type UpdateRolePayload = {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionActions?: string[];
};
