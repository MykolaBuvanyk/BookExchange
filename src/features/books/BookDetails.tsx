"use client";

import { useEffect, useState } from "react";
import { BookDetailsView } from "@/components/books";
import { useAuth } from "@/features/auth";
import type { Book } from "@/types";
import { fetchBookById } from "./booksService";

type BookDetailsProps = {
  bookId: string;
};

export function BookDetails({ bookId }: BookDetailsProps) {
  const { isLoading: isAuthLoading, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadBook() {
      setIsBookLoading(true);
      setError(null);

      try {
        const bookData = await fetchBookById(bookId);

        if (!isCurrentRequest) {
          return;
        }

        setBook(bookData);
      } catch {
        if (!isCurrentRequest) {
          return;
        }

        setError("Could not load this book.");
      } finally {
        if (isCurrentRequest) {
          setIsBookLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isCurrentRequest = false;
    };
  }, [bookId]);

  if (isAuthLoading || isBookLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-md border border-white/20 bg-zinc-950" />
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-white">
          Book not found
        </h1>
        <p className="mt-4 text-zinc-400">
          {error || "This book does not exist or is no longer available."}
        </p>
      </main>
    );
  }

  return (
    <BookDetailsView
      book={book}
      canRequestExchange={Boolean(user && book.ownerId !== user.uid)}
    />
  );
}
