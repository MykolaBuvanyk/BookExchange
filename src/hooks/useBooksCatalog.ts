"use client";

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { fetchBooks } from "@/features/books";
import type {
  Book,
  BookSearchField,
  BookSortOption,
  BooksViewMode,
} from "@/types";

type BooksPageState = {
  books: Book[];
  error: string | null;
  hasMore: boolean;
  isLoading: boolean;
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
};

const initialBooksPageState: BooksPageState = {
  books: [],
  error: null,
  hasMore: false,
  isLoading: true,
  nextCursor: null,
};

export function useBooksCatalog() {
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
        error: null,
        isLoading: true,
      }));

      try {
        const result = await fetchBooks({
          cursor: currentCursor,
          pageSize: DEFAULT_PAGE_SIZE,
          search: appliedSearch,
          searchField: appliedSearchField,
          sort,
        });

        if (!isCurrentRequest) {
          return;
        }

        setPageState({
          books: result.books,
          error: null,
          hasMore: result.hasMore,
          isLoading: false,
          nextCursor: result.nextCursor,
        });
      } catch {
        if (!isCurrentRequest) {
          return;
        }

        setPageState({
          books: [],
          error: "Could not load books. Please try again.",
          hasMore: false,
          isLoading: false,
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchDraft.trim());
    setAppliedSearchField(searchFieldDraft);
    resetPagination();
  }

  function handleSortChange(nextSort: BookSortOption) {
    setSort(nextSort);
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

  return {
    handleNextPage,
    handlePreviousPage,
    handleSearchSubmit,
    handleSortChange,
    page,
    pageState,
    searchDraft,
    searchFieldDraft,
    setSearchDraft,
    setSearchFieldDraft,
    setViewMode,
    sort,
    viewMode,
  };
}
