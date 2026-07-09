import type { Timestamp } from "firebase/firestore";
import type { UserRole } from "./role";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateUserProfileInput = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type UpdateUserProfileInput = Partial<
  Pick<UserProfile, "name" | "email" | "avatarUrl" | "role">
>;
