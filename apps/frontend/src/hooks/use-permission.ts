"use client"

import { useAuth } from "@/features/auth/hooks/use-auth"

const COMPANY_OWNER_ROLE = "Company Owner"

type PermissionAction =
  | "employees.view"
  | "employees.create"
  | "employees.edit"
  | "employees.delete"
  | "attendance.view"
  | "attendance.mark"
  | "attendance.edit"
  | "leave.view"
  | "leave.request"
  | "leave.approve"
  | "payroll.view"
  | "payroll.run"
  | "payroll.edit"
  | "departments.view"
  | "departments.create"
  | "departments.edit"
  | "departments.delete"
  | "reports.view"
  | "reports.export"
  | "settings.view"
  | "settings.edit"
  | "roles.view"
  | "roles.manage"
  | "loans.view"
  | "loans.manage"
  | "approvals.view"
  | "approvals.manage"

export function usePermission() {
  const { user } = useAuth()

  function can(action: PermissionAction | PermissionAction[]) {
    if (!user) return false
    const roleName = user.employee?.role?.name
    if (roleName === COMPANY_OWNER_ROLE) return true
    const list = Array.isArray(action) ? action : [action]
    const owned = user.employee?.role?.permissions?.map((p) => p.permission.code) ?? []
    return list.some((p) => owned.includes(p))
  }

  return { can, user }
}

export { COMPANY_OWNER_ROLE }
export type { PermissionAction }
