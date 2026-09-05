export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: { permission: { id: string; name: string; code: string } }[];
  _count?: { employees: number };
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export type CreateRolePayload = {
  name: string;
  permissionIds?: string[];
};
