export interface User {
  id: string;
  email: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  hireDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED';
  position: string | null;
  basicSalary: number;
  departmentId: string | null;
  roleId: string | null;
  shiftId: string | null;
  department?: Department;
  role?: Role;
}

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
