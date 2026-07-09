"use client";

import { useEffect, useState } from "react";
import { fetchBookById } from "@/features/books";
import type { Book } from "@/types";

export function useBookDetails(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadBook() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedBook = await fetchBookById(bookId);

        if (isCurrentRequest) {
          setBook(loadedBook);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Could not load this book.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isCurrentRequest = false;
    };
  }, [bookId]);

  return { book, error, isLoading };
}
