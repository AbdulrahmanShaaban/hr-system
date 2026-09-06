import type {
  PermissionModule,
  PermissionColumn,
  PermissionModuleId,
  PermissionActionId,
} from "../types/role.types";

export const PERMISSION_COLUMNS: PermissionColumn[] = [
  { key: "view", label: "عرض" },
  { key: "create", label: "إنشاء" },
  { key: "edit", label: "تعديل" },
  { key: "delete", label: "حذف" },
  { key: "approve", label: "اعتماد" },
  { key: "export", label: "تصدير" },
  { key: "bulk-actions", label: "إجراءات جماعية" },
];

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "employees",
    label: "الموظفين",
    cells: {
      view: "employees.view",
      create: "employees.create",
      edit: "employees.edit",
      delete: "employees.delete",
    },
  },
  {
    id: "departments",
    label: "الأقسام",
    cells: {
      view: "departments.view",
      create: "departments.create",
      edit: "departments.edit",
      delete: "departments.delete",
    },
  },
  {
    id: "attendance",
    label: "الحضور والانصراف",
    cells: {
      view: "attendance.view",
      create: "attendance.mark",
      edit: "attendance.edit",
    },
  },
  {
    id: "leave",
    label: "الإجازات",
    cells: {
      view: "leave.view",
      create: "leave.request",
      approve: "leave.approve",
    },
  },
  {
    id: "loans",
    label: "السلف",
    cells: {
      view: "loans.view",
      create: "loans.manage",
      edit: "loans.manage",
      approve: "loans.manage",
    },
  },
  {
    id: "payroll",
    label: "الرواتب",
    cells: {
      view: "payroll.view",
      create: "payroll.run",
      edit: "payroll.edit",
      export: "payroll.view",
    },
  },
  {
    id: "salary-components",
    label: "مكونات الراتب",
    cells: {
      view: "settings.view",
      create: "settings.edit",
      edit: "settings.edit",
    },
  },
  {
    id: "roles",
    label: "الأدوار والصلاحيات",
    cells: {
      view: "roles.view",
      create: "roles.manage",
      edit: "roles.manage",
      delete: "roles.manage",
    },
  },
  {
    id: "documents",
    label: "المستندات",
    cells: {
      view: "employees.view",
      create: "employees.create",
      edit: "employees.edit",
      delete: "employees.delete",
      export: "employees.view",
    },
  },
  {
    id: "reports",
    label: "التقارير",
    cells: {
      view: "reports.view",
      export: "reports.export",
    },
  },
  {
    id: "approvals",
    label: "الطلبات والاعتمادات",
    cells: {
      view: "approvals.view",
      approve: "approvals.manage",
      create: "approvals.manage",
    },
  },
  {
    id: "notifications",
    label: "الإشعارات",
    cells: {
      view: "settings.view",
      create: "settings.edit",
      edit: "settings.edit",
    },
  },
  {
    id: "settings",
    label: "الإعدادات",
    cells: {
      view: "settings.view",
      edit: "settings.edit",
    },
  },
  {
    id: "onboarding",
    label: "التوظيف والتمهيد",
    cells: {
      view: "employees.view",
      create: "employees.create",
      edit: "employees.edit",
    },
  },
];

export function allModuleActions(moduleId: PermissionModuleId): string[] {
  const mod = PERMISSION_MODULES.find((m) => m.id === moduleId);
  if (!mod) return [];
  return Object.values(mod.cells).filter((v): v is string => Boolean(v));
}

export function allColumnActions(actionId: PermissionActionId): string[] {
  const actions: string[] = [];
  for (const mod of PERMISSION_MODULES) {
    const action = mod.cells[actionId];
    if (action) actions.push(action);
  }
  return actions;
}

export function allPermissionActions(): string[] {
  const actions: string[] = [];
  for (const mod of PERMISSION_MODULES) {
    for (const action of Object.values(mod.cells)) {
      if (action) actions.push(action);
    }
  }
  return [...new Set(actions)];
}

export function roleLabelAr(name: string): string {
  const labels: Record<string, string> = {
    "Company Owner": "مدير النظام",
    "HR Manager": "مدير الموارد البشرية",
    "HR Officer": "موظف الموارد البشرية",
    "Department Manager": "مدير القسم",
    "Employee": "موظف",
    "Payroll Admin": "مسؤول الرواتب",
    "Auditor": "مدقق",
  };
  return labels[name] ?? name;
}

export function roleDescriptionAr(role: {
  name: string;
  description?: string | null;
  userCount: number;
}): string {
  if (role.description) return role.description;
  const label = roleLabelAr(role.name);
  return `دور ${label} يشمل ${role.userCount} موظف`;
}
