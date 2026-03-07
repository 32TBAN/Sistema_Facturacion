export type UserRole = "admin" | "cashier";

export type AuthUser = {
  id: string;
  username: string;
  roles: UserRole[];
};

export type LoginPayload = {
  username: string;
  password: string;
};
