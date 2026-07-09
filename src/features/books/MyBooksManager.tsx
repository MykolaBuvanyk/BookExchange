"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  BookForm,
  BookListItem,
  MyBooksEmptyState,
  MyBooksListLoadingState,
  MyBooksLoadingState,
  MyBooksToolbar,
  MyBooksUnauthorizedState,
} from "@/components/books";
import { useAuth } from "@/features/auth";
import { useMyBooks } from "@/hooks";
import type {
  Book,
  BookFormValues,
  BookPhotoSource,
  MyBooksSortOption,
} from "@/types";
import { sortBooks } from "@/utils/books/sortBooks";
import { readCompressedImage } from "@/utils/images/readCompressedImage";
import {
  createBook,
  deleteBook,
  updateBook,
} from "./booksService";

const emptyBookForm: BookFormValues = {
  name: "",
  author: "",
  photoUrl: "",
};

export function MyBooksManager() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const {
    books,
    isLoading: isBooksLoading,
    refreshBooks,
    setBooks,
  } = useMyBooks(profile?.id);
  const [sort, setSort] = useState<MyBooksSortOption>("created-desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormValues>(emptyBookForm);
  const [photoSource, setPhotoSource] = useState<BookPhotoSource>("url");
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoFileDataUrl, setPhotoFileDataUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedBooks = useMemo(() => sortBooks(books, sort), [books, sort]);

  function resetForm() {
    setEditingBook(null);
    setForm(emptyBookForm);
    setPhotoSource("url");
    setPhotoFileName("");
    setPhotoFileDataUrl("");
    setError(null);
  }

  function updateField(field: keyof BookFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(book: Book) {
    setEditingBook(book);
    setForm({
      name: book.name,
      author: book.author,
      photoUrl: book.photoUrl || "",
    });
    setPhotoSource("url");
    setPhotoFileName("");
    setPhotoFileDataUrl("");
    setError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    resetForm();
  }

  function handlePhotoSourceChange(nextPhotoSource: BookPhotoSource) {
    setPhotoSource(nextPhotoSource);
    setError(null);
  }

  function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    readCompressedImage(file)
      .then((compressedImage) => {
        setPhotoFileDataUrl(compressedImage);
        setPhotoFileName(file.name);
        setError(null);
      })
      .catch(() => {
        setPhotoFileDataUrl("");
        setPhotoFileName("");
        setError("Could not process the selected image.");
      });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      setError("You must be logged in to manage books.");
      return;
    }

    if (!form.name.trim()) {
      setError("Enter a book title.");
      return;
    }

    if (!form.author.trim()) {
      setError("Enter an author.");
      return;
    }

    const selectedPhoto =
      photoSource === "file" ? photoFileDataUrl : form.photoUrl?.trim();

    if (photoSource === "file" && !photoFileDataUrl) {
      setError("Choose an image file or switch to Photo URL.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        author: form.author.trim(),
        photoUrl: selectedPhoto || undefined,
      };

      if (editingBook) {
        await updateBook(editingBook.id, payload);
      } else {
        await createBook(payload, profile);
      }

      await refreshBooks();
      closeForm();
    } catch (saveError) {
      console.error(saveError);
      setError("Could not save the book. Check Firestore rules and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(bookId: string) {
    const shouldDelete = window.confirm("Delete this book?");

    if (!shouldDelete) {
      return;
    }

    await deleteBook(bookId);
    setBooks((currentBooks) => currentBooks.filter((book) => book.id !== bookId));
  }

  if (isLoading) {
    return <MyBooksLoadingState />;
  }

  if (!isAuthenticated) {
    return <MyBooksUnauthorizedState />;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-white">My books</h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Add, edit, and remove books you want to offer for exchange.
          </p>
        </div>

        <MyBooksToolbar
          sort={sort}
          onAddBook={openCreateForm}
          onSortChange={setSort}
        />

        {isFormOpen ? (
          <BookForm
            editingBook={editingBook}
            error={error}
            fileName={photoFileName}
            form={form}
            isSubmitting={isSubmitting}
            photoSource={photoSource}
            onClose={closeForm}
            onFieldChange={updateField}
            onFileChange={handlePhotoFileChange}
            onPhotoSourceChange={handlePhotoSourceChange}
            onSubmit={handleSubmit}
          />
        ) : null}

        <section className="grid gap-3">
          {isBooksLoading ? (
            <MyBooksListLoadingState />
          ) : null}

          {!isBooksLoading && sortedBooks.length === 0 ? (
            <MyBooksEmptyState />
          ) : null}

          {sortedBooks.map((book) => (
            <BookListItem
              book={book}
              key={book.id}
              onDelete={handleDelete}
              onEdit={openEditForm}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
