import { Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui";
import type { UserProfile } from "@/types";

type AdminUsersListProps = {
  currentUserId: string;
  isLoading: boolean;
  isSearching?: boolean;
  users: UserProfile[];
  onDelete: (userId: string) => void;
  onEdit: (user: UserProfile) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminUsersList({
  currentUserId,
  isLoading,
  isSearching = false,
  users,
  onDelete,
  onEdit,
}: AdminUsersListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-white/20 p-6 text-zinc-400">
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-white/20 p-8 text-center">
        <h2 className="font-serif text-2xl font-semibold text-white">
          {isSearching ? "No users found" : "No users yet"}
        </h2>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {users.map((user) => (
        <article
          key={user.id}
          className="grid gap-4 rounded-md border border-white/20 p-4 transition-colors hover:border-white sm:grid-cols-[72px_1fr_auto]"
        >
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-sm border border-white/20 bg-zinc-950 font-serif text-xl text-zinc-400">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-full object-cover"
              />
            ) : (
              getInitials(user.name) || <UserRound size={20} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-white">
                {user.name}
              </h2>
              <span className="rounded-md border border-zinc-700 px-2 py-1 text-xs capitalize text-zinc-300">
                {user.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
          </div>

          <div className="flex items-start gap-2 sm:justify-end">
            <Button size="sm" onClick={() => onEdit(user)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={user.id === currentUserId}
              onClick={() => onDelete(user.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
