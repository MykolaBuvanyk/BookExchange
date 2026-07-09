import type { Book } from "@/types";
import type { MyBooksSortOption } from "@/types";

export const myBooksSortOptions: Array<{
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

export function sortBooks(books: Book[], sort: MyBooksSortOption) {
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
