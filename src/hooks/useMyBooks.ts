"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyBooks } from "@/features/books";
import type { Book } from "@/types";

export function useMyBooks(userId?: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBooks = useCallback(async () => {
    if (!userId) {
      setBooks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedBooks = await fetchMyBooks(userId);
      setBooks(loadedBooks);
    } catch {
      setError("Could not load books.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadBooks() {
      if (!userId) {
        setBooks([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const loadedBooks = await fetchMyBooks(userId);

        if (isCurrentRequest) {
          setBooks(loadedBooks);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Could not load books.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      isCurrentRequest = false;
    };
  }, [userId]);

  return {
    books,
    error,
    isLoading,
    refreshBooks,
    setBooks,
  };
}
