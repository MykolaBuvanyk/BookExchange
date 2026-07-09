import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type DocumentSnapshot,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  type DocumentData,
  type QueryConstraint,
  updateDoc,
  where,
} from "firebase/firestore";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import { normalizeSearchValue } from "@/lib/utils";
import type {
  Book,
  BookSearchField,
  BookSortOption,
  CreateBookInput,
  UpdateBookInput,
  UserProfile,
} from "@/types";

type FetchBooksParams = {
  search?: string;
  searchField?: BookSearchField;
  sort?: BookSortOption;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
};

type FetchBooksResult = {
  books: Book[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

function getSortField(sort: BookSortOption) {
  if (sort === "author-asc" || sort === "author-desc") {
    return "author";
  }

  if (sort === "created-desc") {
    return "createdAt";
  }

  return "name";
}

function getSearchField(searchField: BookSearchField) {
  return searchField === "author" ? "searchAuthor" : "searchName";
}

function mapBookDocument(
  document: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>,
): Book {
  const data = document.data();

  if (!data) {
    throw new Error("Book document is empty.");
  }

  return {
    id: document.id,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    name: data.name,
    author: data.author,
    photoUrl: data.photoUrl,
    searchName: data.searchName,
    searchAuthor: data.searchAuthor,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function sortBookItems(books: Book[], sort: BookSortOption) {
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

export async function fetchMyBooks(userId: string) {
  const snapshot = await getDocs(
    query(collection(db, collections.books), where("ownerId", "==", userId)),
  );

  return snapshot.docs.map(mapBookDocument);
}

export async function fetchAllBooks() {
  const snapshot = await getDocs(
    query(collection(db, collections.books), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map(mapBookDocument);
}

export async function fetchBookById(bookId: string) {
  const snapshot = await getDoc(doc(db, collections.books, bookId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapBookDocument(snapshot);
}

export async function createBook(input: CreateBookInput, owner: UserProfile) {
  const bookReference = doc(collection(db, collections.books));

  await setDoc(bookReference, {
    id: bookReference.id,
    ownerId: owner.id,
    ownerName: owner.name,
    ownerEmail: owner.email,
    name: input.name,
    author: input.author,
    photoUrl: input.photoUrl || null,
    searchName: normalizeSearchValue(input.name),
    searchAuthor: normalizeSearchValue(input.author),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBook(bookId: string, input: UpdateBookInput) {
  const bookUpdate: Record<
    string,
    string | null | ReturnType<typeof serverTimestamp>
  > = {
    updatedAt: serverTimestamp(),
  };

  if (input.name !== undefined) {
    bookUpdate.name = input.name;
    bookUpdate.searchName = normalizeSearchValue(input.name);
  }

  if (input.author !== undefined) {
    bookUpdate.author = input.author;
    bookUpdate.searchAuthor = normalizeSearchValue(input.author);
  }

  if (input.photoUrl !== undefined) {
    bookUpdate.photoUrl = input.photoUrl || null;
  }

  await updateDoc(doc(db, collections.books, bookId), bookUpdate);
}

export async function deleteBook(bookId: string) {
  await deleteDoc(doc(db, collections.books, bookId));
}

export async function fetchBooks({
  search = "",
  searchField = "name",
  sort = "name-asc",
  pageSize = DEFAULT_PAGE_SIZE,
  cursor = null,
}: FetchBooksParams = {}): Promise<FetchBooksResult> {
  const normalizedSearch = normalizeSearchValue(search);
  const constraints: QueryConstraint[] = [];

  if (normalizedSearch) {
    const firestoreSearchField = getSearchField(searchField);

    constraints.push(
      orderBy(firestoreSearchField),
      startAt(normalizedSearch),
      endAt(`${normalizedSearch}\uf8ff`),
    );
  } else {
    const sortField = getSortField(sort);
    const sortDirection =
      sort === "created-desc" || sort.endsWith("-desc") ? "desc" : "asc";

    constraints.push(orderBy(sortField, sortDirection));
  }

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize + 1));

  const snapshot = await getDocs(
    query(collection(db, collections.books), ...constraints),
  );
  const visibleDocuments = snapshot.docs.slice(0, pageSize);

  return {
    books: sortBookItems(visibleDocuments.map(mapBookDocument), sort),
    nextCursor:
      snapshot.docs.length > pageSize
        ? visibleDocuments[visibleDocuments.length - 1]
        : null,
    hasMore: snapshot.docs.length > pageSize,
  };
}
