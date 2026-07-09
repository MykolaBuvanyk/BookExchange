import { ExchangeRequestButton } from "@/features/exchange-requests/ExchangeRequestButton";
import type { Book } from "@/types";

type BookDetailsViewProps = {
  book: Book;
  canRequestExchange: boolean;
};

export function BookDetailsView({
  book,
  canRequestExchange,
}: BookDetailsViewProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="w-full">
          <div
            className="flex aspect-[3/4] w-full items-center justify-center rounded-md border border-white/20 bg-zinc-950 bg-cover bg-center font-serif text-8xl text-zinc-600"
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
        </div>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Book details
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-white">
              {book.name}
            </h1>
            <p className="mt-4 text-xl text-zinc-300">by {book.author}</p>
          </div>

          <div className="rounded-md border border-white/20 p-4">
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Owner
            </p>
            <p className="mt-2 text-base text-white">{book.ownerName}</p>
          </div>

          {canRequestExchange ? (
            <ExchangeRequestButton book={book} />
          ) : (
            <p className="rounded-md border border-white/20 px-4 py-3 text-sm text-zinc-400">
              This is your book.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
