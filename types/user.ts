export type Role = "admin" | "manager" | "user";

export interface User {
  id: string;

  name: string;

  role: Role;

  email: string;
}
