export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  usersCount?: number;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  status: "active" | "inactive";
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: Role;
}
