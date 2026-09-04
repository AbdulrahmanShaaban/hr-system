export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
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
