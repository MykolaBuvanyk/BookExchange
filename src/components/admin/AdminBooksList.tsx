import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Book } from "@/types";

type AdminBooksListProps = {
  books: Book[];
  isLoading: boolean;
  isSearching?: boolean;
  onDelete: (bookId: string) => void;
};

export function AdminBooksList({
  books,
  isLoading,
  isSearching = false,
  onDelete,
}: AdminBooksListProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-white/20 p-6 text-zinc-400">
        Loading books...
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-md border border-white/20 p-8 text-center">
        <h2 className="font-serif text-2xl font-semibold text-white">
          {isSearching ? "No books found" : "No books yet"}
        </h2>
      </div>
    );
  }

  return (
    <section className="grid gap-3">
      {books.map((book) => (
        <article
          key={book.id}
          className="grid gap-4 rounded-md border border-white/20 p-4 transition-colors hover:border-white sm:grid-cols-[72px_1fr_auto]"
        >
          <div
            className="flex h-24 w-[72px] items-center justify-center rounded-sm border border-white/20 bg-zinc-950 bg-cover bg-center font-serif text-2xl text-zinc-500"
            style={
              book.photoUrl
                ? { backgroundImage: `url(${book.photoUrl})` }
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
            <p className="mt-2 text-sm text-zinc-500">
              Owner: {book.ownerName} - {book.ownerEmail}
            </p>
          </div>

          <div className="flex items-start gap-2 sm:justify-end">
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(book.id)}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
