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

export type BookSortOption = "name-asc" | "author-asc" | "created-desc";

export type BooksSearchParams = {
  query?: string;
  sort?: BookSortOption;
  pageSize?: number;
};
