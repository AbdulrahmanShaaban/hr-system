export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
  _count?: { employees: number };
  createdAt: string;
  updatedAt: string;
}

export type CreateDepartmentPayload = {
  name: string;
  parentId?: string | null;
};
