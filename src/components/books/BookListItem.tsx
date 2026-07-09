import { Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

type BookListItemProps = {
  book: Book;
  onDelete: (bookId: string) => void;
  onEdit: (book: Book) => void;
};

export function BookListItem({ book, onDelete, onEdit }: BookListItemProps) {
  return (
    <article
      className="grid gap-4 rounded-md border border-white/20 p-4 transition-colors hover:border-white sm:grid-cols-[72px_1fr_auto]"
    >
      <div
        className="flex h-24 w-[72px] items-center justify-center rounded-sm border border-white/20 bg-zinc-950 bg-cover bg-center font-serif text-2xl text-zinc-500"
        style={
          book.photoUrl
            ? {
                backgroundImage: `url(${book.photoUrl})`,
              }
            : undefined
        }
      >
        {book.photoUrl ? null : book.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <h2 className="font-serif text-xl font-semibold text-white">
          {book.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{book.author}</p>
      </div>

      <div className="flex items-start gap-2 sm:justify-end">
        <button
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border border-white text-white transition-colors",
            "hover:bg-white hover:text-black",
          )}
          onClick={() => onEdit(book)}
          title="Edit book"
          type="button"
        >
          <Edit3 size={16} />
        </button>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-600 bg-red-600 text-white transition-colors hover:border-red-700 hover:bg-red-700"
          onClick={() => onDelete(book.id)}
          title="Delete book"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
