import type { UserRole } from "@/types";

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const satisfies Record<string, UserRole>;

export const DEFAULT_USER_ROLE: UserRole = USER_ROLES.USER;
