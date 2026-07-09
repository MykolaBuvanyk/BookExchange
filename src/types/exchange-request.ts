import type { Timestamp } from "firebase/firestore";

export type ExchangeRequestStatus = "pending" | "accepted" | "rejected";

export type ExchangeRequestOfferedBook = {
  id: string;
  name: string;
  author: string;
};

export type ExchangeRequest = {
  id: string;
  bookId: string;
  bookName: string;
  ownerId: string;
  ownerEmail: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterBookIds: string[];
  offeredBooks: ExchangeRequestOfferedBook[];
  status: ExchangeRequestStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateExchangeRequestInput = {
  bookId: string;
  requesterBookIds: string[];
};
