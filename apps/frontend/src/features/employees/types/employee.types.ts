export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string | { id: string; name: string; [key: string]: unknown };
  department: string | { id: string; name: string; [key: string]: unknown };
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  avatar?: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

export type CreateEmployeePayload = Omit<Employee, "id">;
