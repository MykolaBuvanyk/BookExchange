import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { AdminNavLink } from "@/features/auth/AdminNavLink";
import { UserMenu } from "@/features/auth/UserMenu";
import { routes } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-black/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={routes.home}
          className="font-serif text-2xl font-semibold text-white transition-opacity hover:opacity-80"
        >
          BookExchange
        </Link>

        <div className="flex items-center gap-3">
          <ButtonLink href={routes.books} size="sm">
            Find books
          </ButtonLink>
          <AdminNavLink />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
