import type { QueryDocumentSnapshot } from "firebase/firestore";

export type PaginationCursor = QueryDocumentSnapshot | null;

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: PaginationCursor;
  hasMore: boolean;
};
