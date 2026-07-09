import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Book, BooksViewMode } from "@/types";

type BookCardProps = {
  book: Book;
  viewMode: BooksViewMode;
};

export function BookCard({ book, viewMode }: BookCardProps) {
  const isList = viewMode === "list";

  return (
    <Link
      href={routes.bookDetails(book.id)}
      className={cn(
        "group border border-white/30 bg-black transition-colors hover:border-white hover:bg-white hover:text-black",
        isList
          ? "grid grid-cols-[96px_1fr] gap-4 rounded-md p-3"
          : "flex flex-col rounded-md p-3",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-sm border border-white/20 bg-zinc-950 bg-cover bg-center font-serif text-3xl text-zinc-500 transition-colors group-hover:border-black/20 group-hover:bg-zinc-100 group-hover:text-zinc-500",
          isList ? "h-32 w-24" : "aspect-[3/4] w-full",
        )}
        style={
          book.photoUrl
            ? {
                backgroundImage: `url(${book.photoUrl})`,
              }
            : undefined
        }
        aria-label={`${book.name} cover`}
      >
        {book.photoUrl ? null : book.name.charAt(0).toUpperCase()}
      </div>

      <div className={cn("min-w-0", isList ? "py-1" : "mt-4")}>
        <h2 className="line-clamp-2 font-serif text-xl font-semibold text-white transition-colors group-hover:text-black">
          {book.name}
        </h2>
        <p className="mt-2 truncate text-sm text-zinc-400 transition-colors group-hover:text-zinc-700">
          {book.author}
        </p>
        <p className="mt-4 truncate text-xs uppercase tracking-wide text-zinc-500 transition-colors group-hover:text-zinc-600">
          Owner: {book.ownerName}
        </p>
      </div>
    </Link>
  );
}
