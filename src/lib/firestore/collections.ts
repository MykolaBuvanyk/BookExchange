export const collections = {
  users: "users",
  books: "books",
  exchangeRequests: "exchangeRequests",
} as const;

export type CollectionName = (typeof collections)[keyof typeof collections];
