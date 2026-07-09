"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { routes } from "@/lib/routes";
import { getInitials } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { logoutUser } from "./authService";

export function UserMenu() {
  const { isAuthenticated, isLoading, profile, user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = profile?.name || user?.displayName || user?.email || "Account";

  async function handleLogout() {
    await logoutUser();
    setIsOpen(false);
    router.push(routes.login);
  }

  if (isLoading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-md border border-white/20 bg-zinc-950" />
    );
  }

  if (!isAuthenticated) {
    return (
      <ButtonLink href={routes.login} size="sm">
        Login
      </ButtonLink>
    );
  }

  return (
    <div className="relative">
      <button
        className="inline-flex h-9 items-center gap-2 rounded-md border border-white bg-transparent px-3 text-sm font-medium text-white transition-colors hover:bg-white hover:!text-black"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-current text-xs">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </span>
        <span className="max-w-32 truncate">{displayName}</span>
        <span
          className="h-2 w-2 rotate-45 border-b border-r border-current"
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-3 w-56 rounded-md border border-white/20 bg-black p-2 shadow-2xl shadow-black">
          <Link
            className="block rounded-sm px-3 py-2 text-sm text-white transition-colors hover:bg-white hover:!text-black"
            href={routes.myBooks}
            onClick={() => setIsOpen(false)}
          >
            My books
          </Link>
          <Link
            className="block rounded-sm px-3 py-2 text-sm text-white transition-colors hover:bg-white hover:!text-black"
            href={routes.profile}
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <div className="my-2 border-t border-white/20" />
          <Button
            className="w-full justify-start"
            size="sm"
            variant="danger"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      ) : null}
    </div>
  );
}
