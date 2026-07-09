export function MyBooksLoadingState() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-40 animate-pulse rounded-md border border-white/20 bg-zinc-950" />
    </main>
  );
}

export function MyBooksUnauthorizedState() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-white">My books</h1>
      <p className="mt-4 text-zinc-400">Login to manage your book collection.</p>
    </main>
  );
}

export function MyBooksEmptyState() {
  return (
    <div className="rounded-md border border-white/20 p-8 text-center">
      <h2 className="font-serif text-2xl font-semibold text-white">
        No books yet
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Add your first book to start exchanging.
      </p>
    </div>
  );
}

export function MyBooksListLoadingState() {
  return (
    <div className="rounded-md border border-white/20 p-6 text-zinc-400">
      Loading your books...
    </div>
  );
}
