"use client";

import { Plus, Search } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AdminBooksList,
  AdminTabs,
  AdminUserForm,
  AdminUsersList,
  type AdminTab,
} from "@/components/admin";
import { Button, FieldError, Input } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { deleteBook, fetchAllBooks } from "@/features/books";
import type { Book, UserProfile, UserRole } from "@/types";
import { sortBooks } from "@/utils/books/sortBooks";
import {
  createManagedUserProfile,
  deleteManagedUserProfile,
  fetchAdminUsers,
  updateManagedUserProfile,
  type AdminUserFormValues,
} from "./adminUsersService";

const emptyUserForm: AdminUserFormValues = {
  email: "",
  name: "",
  role: "user",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AdminPanel() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState<AdminUserFormValues>(emptyUserForm);
  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.role === "admin";
  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return [user.name, user.email, user.role].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [userSearch, users]);

  const filteredBooks = useMemo(() => {
    const normalizedSearch = bookSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return books;
    }

    return books.filter((book) => {
      return [book.name, book.author, book.ownerName, book.ownerEmail].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [bookSearch, books]);

  const sortedBooks = useMemo(
    () => sortBooks(filteredBooks, "created-desc"),
    [filteredBooks],
  );

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let isCurrentRequest = true;

    async function loadAdminData() {
      setIsLoadingContent(true);

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
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingContent(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isCurrentRequest = false;
    };
  }, [isAdmin]);

  function resetUserForm() {
    setEditingUser(null);
    setUserForm(emptyUserForm);
    setError("");
  }

  function openCreateUserForm() {
    resetUserForm();
    setIsUserFormOpen(true);
  }

  function openEditUserForm(user: UserProfile) {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setError("");
    setIsUserFormOpen(true);
  }

  function closeUserForm() {
    setIsUserFormOpen(false);
    resetUserForm();
  }

  function updateUserField(field: keyof AdminUserFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setUserForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  async function refreshUsers() {
    const loadedUsers = await fetchAdminUsers();
    setUsers(loadedUsers);
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userForm.name.trim() || !userForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (editingUser) {
        await updateManagedUserProfile(editingUser.id, userForm);
      } else {
        await createManagedUserProfile(userForm);
      }

      await refreshUsers();
      closeUserForm();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (userId === profile?.id) {
      setError("You cannot delete your own admin profile.");
      return;
    }

    const shouldDelete = window.confirm("Delete this user profile?");

    if (!shouldDelete) {
      return;
    }

    await deleteManagedUserProfile(userId);
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
  }

  async function handleDeleteBook(bookId: string) {
    const shouldDelete = window.confirm("Delete this book?");

    if (!shouldDelete) {
      return;
    }

    await deleteBook(bookId);
    setBooks((currentBooks) =>
      currentBooks.filter((book) => book.id !== bookId),
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-md border border-white/20 bg-zinc-950" />
      </main>
    );
  }

  if (!isAuthenticated || !isAdmin || !profile) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-white">Admin</h1>
        <p className="mt-4 text-zinc-400">
          You need an admin account to access this page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-white">Admin</h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Manage user profiles and remove books from the exchange catalog.
          </p>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {error ? <FieldError>{error}</FieldError> : null}

        {activeTab === "users" ? (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button className="sm:w-fit" onClick={openCreateUserForm}>
                <Plus size={18} />
                Add user
              </Button>

              <label className="relative w-full sm:max-w-sm">
                <span className="sr-only">Search users</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  className="pl-10"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users"
                />
              </label>
            </div>

            {isUserFormOpen ? (
              <AdminUserForm
                editingUser={editingUser}
                form={userForm}
                isSubmitting={isSubmitting}
                onClose={closeUserForm}
                onFieldChange={updateUserField}
                onRoleChange={(role: UserRole) =>
                  setUserForm((currentForm) => ({ ...currentForm, role }))
                }
                onSubmit={handleUserSubmit}
              />
            ) : null}

            <AdminUsersList
              currentUserId={profile.id}
              isLoading={isLoadingContent}
              isSearching={Boolean(userSearch.trim())}
              users={filteredUsers}
              onDelete={handleDeleteUser}
              onEdit={openEditUserForm}
            />
          </section>
        ) : null}

        {activeTab === "books" ? (
          <section className="flex flex-col gap-4">
            <div className="flex justify-end">
              <label className="relative w-full sm:max-w-sm">
                <span className="sr-only">Search books</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  className="pl-10"
                  value={bookSearch}
                  onChange={(event) => setBookSearch(event.target.value)}
                  placeholder="Search books"
                />
              </label>
            </div>

            <AdminBooksList
              books={sortedBooks}
              isLoading={isLoadingContent}
              isSearching={Boolean(bookSearch.trim())}
              onDelete={handleDeleteBook}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
