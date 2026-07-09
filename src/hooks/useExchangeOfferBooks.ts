"use client";

import { useMemo, useState } from "react";
import { fetchMyBooks } from "@/features/books";
import type { Book } from "@/types";

export function useExchangeOfferBooks(userId?: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [hasLoadedBooks, setHasLoadedBooks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBooks = useMemo(() => {
    return books.filter((book) => selectedBookIds.includes(book.id));
  }, [books, selectedBookIds]);

  async function loadBooks() {
    if (!userId || hasLoadedBooks) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedBooks = await fetchMyBooks(userId);
      setBooks(loadedBooks);
      setHasLoadedBooks(true);
    } catch {
      setError("Could not load your books.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetSelection() {
    setSelectedBookIds([]);
  }

  function toggleBookSelection(bookId: string) {
    setSelectedBookIds((currentIds) => {
      if (currentIds.includes(bookId)) {
        return currentIds.filter((currentId) => currentId !== bookId);
      }

      return [...currentIds, bookId];
    });
  }

  return {
    books,
    error,
    isLoading,
    loadBooks,
    resetSelection,
    selectedBookIds,
    selectedBooks,
    setError,
    toggleBookSelection,
  };
}
