export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  books: "/books",
  bookDetails: (bookId: string) => `/books/${bookId}`,
  myBooks: "/me/books",
  profile: "/profile",
  admin: "/admin",
} as const;
