"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteManagedUserProfile,
  fetchAdminUsers,
} from "@/features/admin/adminUsersService";
import { deleteBook, fetchAllBooks } from "@/features/books";
import type { Book, UserProfile } from "@/types";

export function useAdminData(isEnabled: boolean) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshUsers = useCallback(async () => {
    const loadedUsers = await fetchAdminUsers();
    setUsers(loadedUsers);
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadAdminData() {
      if (!isEnabled) {
        setUsers([]);
        setBooks([]);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [loadedUsers, loadedBooks] = await Promise.all([
          fetchAdminUsers(),
          fetchAllBooks(),
        ]);

        if (!isCurrentRequest) {
          return;
        }

        setUsers(loadedUsers);
        setBooks(loadedBooks);
      } catch (loadError) {
        if (isCurrentRequest) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load admin data.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isCurrentRequest = false;
    };
  }, [isEnabled]);

  const removeUser = useCallback(async (userId: string) => {
    await deleteManagedUserProfile(userId);
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
  }, []);

  const removeBook = useCallback(async (bookId: string) => {
    await deleteBook(bookId);
    setBooks((currentBooks) =>
      currentBooks.filter((book) => book.id !== bookId),
    );
  }, []);

  return {
    books,
    error,
    isLoading,
    refreshUsers,
    removeBook,
    removeUser,
    setError,
    users,
  };
}
