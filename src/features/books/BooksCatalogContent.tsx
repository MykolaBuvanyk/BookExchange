"use client";

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Search } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { BookCard } from "@/components/books";
import { Button, Field, Input, Label, SelectDropdown } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type {
  Book,
  BookSearchField,
  BookSortOption,
  BooksViewMode,
} from "@/types";
import { fetchBooks } from "./booksService";

type BooksPageState = {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
};

type CatalogPaginationProps = {
  hasMore: boolean;
  isLoading: boolean;
  page: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

const initialBooksPageState: BooksPageState = {
  books: [],
  isLoading: true,
  error: null,
  hasMore: false,
  nextCursor: null,
};

const searchFieldOptions: Array<{
  label: string;
  value: BookSearchField;
}> = [
  {
    label: "Title",
    value: "name",
  },
  {
    label: "Author",
    value: "author",
  },
];

const sortOptions: Array<{
  label: string;
  value: BookSortOption;
}> = [
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

function CatalogPagination({
  hasMore,
  isLoading,
  page,
  onNextPage,
  onPreviousPage,
}: CatalogPaginationProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4">
      <Button
        className="w-fit"
        disabled={page === 1 || isLoading}
        onClick={onPreviousPage}
      >
        Previous
      </Button>
      <span className="flex h-10 min-w-10 items-center justify-center rounded-md border border-white bg-white px-3 text-sm font-medium text-black">
        {page}
      </span>
      <Button
        className="w-fit justify-self-end"
        disabled={!hasMore || isLoading}
        onClick={onNextPage}
      >
        Next
      </Button>
    </div>
  );
}

export function BooksCatalog() {
  const [searchDraft, setSearchDraft] = useState("");
  const [searchFieldDraft, setSearchFieldDraft] =
    useState<BookSearchField>("name");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSearchField, setAppliedSearchField] =
    useState<BookSearchField>("name");
  const [sort, setSort] = useState<BookSortOption>("name-asc");
  const [viewMode, setViewMode] = useState<BooksViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<
    Array<QueryDocumentSnapshot<DocumentData> | null>
  >([null]);
  const [pageState, setPageState] = useState<BooksPageState>(
    initialBooksPageState,
  );

  const currentCursor = pageCursors[page - 1] ?? null;

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadBooks() {
      setPageState((currentState) => ({
        ...currentState,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await fetchBooks({
          search: appliedSearch,
          searchField: appliedSearchField,
          sort,
          pageSize: DEFAULT_PAGE_SIZE,
          cursor: currentCursor,
        });

        if (!isCurrentRequest) {
          return;
        }

        setPageState({
          books: result.books,
          isLoading: false,
          error: null,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        });
      } catch {
        if (!isCurrentRequest) {
          return;
        }

        setPageState({
          books: [],
          isLoading: false,
          error: "Could not load books. Please try again.",
          hasMore: false,
          nextCursor: null,
        });
      }
    }

    loadBooks();

    return () => {
      isCurrentRequest = false;
    };
  }, [appliedSearch, appliedSearchField, currentCursor, sort]);

  function resetPagination() {
    setPage(1);
    setPageCursors([null]);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchDraft(event.target.value);
  }

  function handleSearchFieldChange(nextSearchField: BookSearchField) {
    setSearchFieldDraft(nextSearchField);
  }

  function handleSortChange(nextSort: BookSortOption) {
    setSort(nextSort);
    resetPagination();
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchDraft.trim());
    setAppliedSearchField(searchFieldDraft);
    resetPagination();
  }

  function handleNextPage() {
    if (!pageState.nextCursor) {
      return;
    }

    setPageCursors((currentCursors) => {
      const nextCursors = currentCursors.slice(0, page);
      nextCursors[page] = pageState.nextCursor;
      return nextCursors;
    });
    setPage((currentPage) => currentPage + 1);
  }

  function handlePreviousPage() {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-white">
            Book catalog
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
            Search available books by title or author, then open a book page to
            request an exchange.
          </p>
        </div>

        <form
          className="grid gap-4 md:grid-cols-[1fr_180px_auto]"
          onSubmit={handleSearchSubmit}
        >
          <Field>
            <Label htmlFor="bookSearch">Search</Label>
            <Input
              id="bookSearch"
              value={searchDraft}
              onChange={handleSearchChange}
              placeholder="Search books"
            />
          </Field>

          <SelectDropdown
            label="Search by"
            options={searchFieldOptions}
            value={searchFieldDraft}
            onChange={handleSearchFieldChange}
          />

          <div className="flex items-end">
            <Button aria-label="Search books" className="h-11 px-4" type="submit">
              <Search size={18} />
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
          <SelectDropdown
            className="md:w-56"
            label="Sort"
            options={sortOptions}
            showLabel={false}
            value={sort}
            onChange={handleSortChange}
          />

          <div className="flex h-11 gap-2 md:justify-end">
            <Button
              size="md"
              variant={viewMode === "grid" ? "solid" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              size="md"
              variant={viewMode === "list" ? "solid" : "outline"}
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>

        {pageState.error ? (
          <div className="rounded-md border border-red-300/60 px-4 py-3 text-sm text-red-200">
            {pageState.error}
          </div>
        ) : null}

        {pageState.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                className="h-80 animate-pulse rounded-md border border-white/20 bg-zinc-950"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!pageState.isLoading && pageState.books.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                : "grid gap-4"
            }
          >
            {pageState.books.map((book) => (
              <BookCard book={book} key={book.id} viewMode={viewMode} />
            ))}
          </div>
        ) : null}

        {!pageState.isLoading && pageState.books.length === 0 ? (
          <div className="rounded-md border border-white/20 px-6 py-12 text-center">
            <h2 className="font-serif text-2xl font-semibold text-white">
              No books yet
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Try another search or add your first book later from My Books.
            </p>
          </div>
        ) : null}

        <CatalogPagination
          hasMore={pageState.hasMore}
          isLoading={pageState.isLoading}
          page={page}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </section>
  );
}
