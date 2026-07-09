"use client";

import { Edit3, Plus, Trash2, Upload, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Field,
  FieldError,
  Input,
  Label,
  SelectDropdown,
} from "@/components/ui";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import type { Book, CreateBookInput } from "@/types";
import {
  createBook,
  deleteBook,
  fetchMyBooks,
  type MyBooksSortOption,
  updateBook,
} from "./books-service";

type BookFormState = CreateBookInput;
type PhotoSource = "url" | "file";

const sortOptions: Array<{
  label: string;
  value: MyBooksSortOption;
}> = [
  {
    label: "Newest first",
    value: "created-desc",
  },
  {
    label: "Title A-Z",
    value: "name-asc",
  },
  {
    label: "Title Z-A",
    value: "name-desc",
  },
  {
    label: "Author A-Z",
    value: "author-asc",
  },
  {
    label: "Author Z-A",
    value: "author-desc",
  },
];

const emptyBookForm: BookFormState = {
  name: "",
  author: "",
  photoUrl: "",
};

function readCompressedImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Could not load image file."));
      image.onload = () => {
        const maxSize = 720;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not process image file."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

function sortBooks(books: Book[], sort: MyBooksSortOption) {
  return [...books].sort((firstBook, secondBook) => {
    if (sort === "name-asc") {
      return firstBook.name.localeCompare(secondBook.name);
    }

    if (sort === "name-desc") {
      return secondBook.name.localeCompare(firstBook.name);
    }

    if (sort === "author-asc") {
      return firstBook.author.localeCompare(secondBook.author);
    }

    if (sort === "author-desc") {
      return secondBook.author.localeCompare(firstBook.author);
    }

    const firstDate = firstBook.createdAt?.toMillis?.() ?? 0;
    const secondDate = secondBook.createdAt?.toMillis?.() ?? 0;

    return secondDate - firstDate;
  });
}

export function MyBooksManager() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [sort, setSort] = useState<MyBooksSortOption>("created-desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormState>(emptyBookForm);
  const [photoSource, setPhotoSource] = useState<PhotoSource>("url");
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoFileDataUrl, setPhotoFileDataUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooksLoading, setIsBooksLoading] = useState(false);

  const sortedBooks = useMemo(() => sortBooks(books, sort), [books, sort]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    let isCurrentRequest = true;

    async function loadBooks() {
      setIsBooksLoading(true);

      try {
        const userBooks = await fetchMyBooks(profile.id);

        if (isCurrentRequest) {
          setBooks(userBooks);
        }
      } finally {
        if (isCurrentRequest) {
          setIsBooksLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      isCurrentRequest = false;
    };
  }, [profile]);

  function updateField(field: keyof BookFormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };
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

  function handlePhotoSourceChange(nextPhotoSource: PhotoSource) {
    setPhotoSource(nextPhotoSource);
    setError(null);
  }

  function openCreateForm() {
    setEditingBook(null);
    setForm(emptyBookForm);
    setPhotoSource("url");
    setPhotoFileName("");
    setPhotoFileDataUrl("");
    setError(null);
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
    setEditingBook(null);
    setForm(emptyBookForm);
    setPhotoSource("url");
    setPhotoFileName("");
    setPhotoFileDataUrl("");
    setError(null);
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

    setError(null);
    setIsSubmitting(true);

    try {
      const selectedPhoto =
        photoSource === "file" ? photoFileDataUrl : form.photoUrl?.trim();

      if (photoSource === "file" && !photoFileDataUrl) {
        setError("Choose an image file or switch to Photo URL.");
        setIsSubmitting(false);
        return;
      }

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

      const userBooks = await fetchMyBooks(profile.id);
      setBooks(userBooks);
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
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-md border border-white/20 bg-zinc-950" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-white">My books</h1>
        <p className="mt-4 text-zinc-400">Login to manage your book collection.</p>
      </main>
    );
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

        <div className="flex flex-col gap-4 border-y border-white/20 py-4 sm:flex-row sm:items-end sm:justify-between">
          <Button className="sm:w-fit" onClick={openCreateForm}>
            <Plus size={18} />
            Add new book
          </Button>

          <SelectDropdown
            className="sm:w-56"
            label="Sort"
            options={sortOptions}
            value={sort}
            onChange={setSort}
          />
        </div>

        {isFormOpen ? (
          <form
            className="rounded-md border border-white/20 p-4"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-white">
                {editingBook ? "Edit book" : "Add new book"}
              </h2>
              <Button size="sm" variant="ghost" onClick={closeForm}>
                <X size={16} />
                Close
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field>
                <Label htmlFor="bookName">Title</Label>
                <Input
                  id="bookName"
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="The Master and Margarita"
                />
              </Field>

              <Field>
                <Label htmlFor="bookAuthor">Author</Label>
                <Input
                  id="bookAuthor"
                  value={form.author}
                  onChange={updateField("author")}
                  placeholder="Taras Shevchenko"
                />
              </Field>

              <div className="md:col-span-2">
                <Label>Book photo</Label>
                <div className="mt-2 grid grid-cols-2 rounded-md border border-white p-1">
                  <button
                    className={
                      photoSource === "url"
                        ? "rounded-sm bg-white px-3 py-2 text-sm font-medium text-black"
                        : "rounded-sm px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
                    }
                    onClick={() => handlePhotoSourceChange("url")}
                    type="button"
                  >
                    Photo URL
                  </button>
                  <button
                    className={
                      photoSource === "file"
                        ? "rounded-sm bg-white px-3 py-2 text-sm font-medium text-black"
                        : "rounded-sm px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
                    }
                    onClick={() => handlePhotoSourceChange("file")}
                    type="button"
                  >
                    Upload file
                  </button>
                </div>

                {photoSource === "url" ? (
                  <Field className="mt-4">
                    <Label htmlFor="bookPhoto">Photo URL</Label>
                    <Input
                      id="bookPhoto"
                      value={form.photoUrl}
                      onChange={updateField("photoUrl")}
                      placeholder="https://..."
                    />
                  </Field>
                ) : (
                  <Field className="mt-4">
                    <Label htmlFor="bookPhotoFile">Upload photo</Label>
                    <label
                      className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-white bg-black px-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
                      htmlFor="bookPhotoFile"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Upload size={18} />
                        <span className="truncate">
                          {photoFileName || "Choose image file"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs opacity-70">Browse</span>
                    </label>
                    <input
                      className="sr-only"
                      id="bookPhotoFile"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      type="file"
                    />
                    <p className="text-sm text-zinc-500">
                      This uses the uploaded file only. It will not fill the URL
                      field.
                    </p>
                  </Field>
                )}
              </div>
            </div>

            {error ? <FieldError className="mt-4">{error}</FieldError> : null}

            <Button className="mt-5" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingBook ? "Save changes" : "Add book"}
            </Button>
          </form>
        ) : null}

        <section className="grid gap-3">
          {isBooksLoading ? (
            <div className="rounded-md border border-white/20 p-6 text-zinc-400">
              Loading your books...
            </div>
          ) : null}

          {!isBooksLoading && sortedBooks.length === 0 ? (
            <div className="rounded-md border border-white/20 p-8 text-center">
              <h2 className="font-serif text-2xl font-semibold text-white">
                No books yet
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Add your first book to start exchanging.
              </p>
            </div>
          ) : null}

          {sortedBooks.map((book) => (
            <article
              className="grid gap-4 rounded-md border border-white/20 p-4 transition-colors hover:border-white sm:grid-cols-[72px_1fr_auto]"
              key={book.id}
            >
              <div
                className="flex h-24 w-[72px] items-center justify-center rounded-sm border border-white/20 bg-zinc-950 bg-cover bg-center font-serif text-2xl text-zinc-500"
                style={
                  book.photoUrl
                    ? {
                        backgroundImage: `url(${book.photoUrl})`,
                      }
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
              </div>

              <div className="flex items-start gap-2 sm:justify-end">
                <button
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-white text-white transition-colors",
                    "hover:bg-white hover:text-black",
                  )}
                  onClick={() => openEditForm(book)}
                  title="Edit book"
                  type="button"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-600 bg-red-600 text-white transition-colors hover:border-red-700 hover:bg-red-700"
                  onClick={() => handleDelete(book.id)}
                  title="Delete book"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
