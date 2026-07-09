"use client";

import { ButtonLink } from "@/components/ui";
import { routes } from "@/lib/routes";
import { useAuth } from "./AuthProvider";

export function AdminNavLink() {
  const { profile } = useAuth();

  if (profile?.role !== "admin") {
    return null;
  }

  return (
    <ButtonLink href={routes.admin} size="sm">
      Admin
    </ButtonLink>
  );
}
