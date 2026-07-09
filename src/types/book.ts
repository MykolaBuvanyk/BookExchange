import type { Timestamp } from "firebase/firestore";

export type Book = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  author: string;
  photoUrl?: string;
  searchName: string;
  searchAuthor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateBookInput = {
  name: string;
  author: string;
  photoUrl?: string;
};

export type UpdateBookInput = Partial<CreateBookInput>;
export type BookFormValues = CreateBookInput;
export type BookPhotoSource = "url" | "file";

export type BookSortOption =
  | "name-asc"
  | "name-desc"
  | "author-asc"
  | "author-desc"
  | "created-desc";
export type MyBooksSortOption = BookSortOption;
export type BookSearchField = "name" | "author";
export type BooksViewMode = "grid" | "list";

export type BooksSearchParams = {
  query?: string;
  searchField?: BookSearchField;
  sort?: BookSortOption;
  pageSize?: number;
};
