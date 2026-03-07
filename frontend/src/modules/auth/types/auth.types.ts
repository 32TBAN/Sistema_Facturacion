export type UserRole = "admin" | "empleado" | "lector";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
};

export type LoginPayload = {
  email: string;
  password: string;
};
