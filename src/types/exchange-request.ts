import type { Timestamp } from "firebase/firestore";

export type ExchangeRequestStatus = "pending" | "sent" | "failed";

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
  status: ExchangeRequestStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateExchangeRequestInput = {
  bookId: string;
  requesterBookIds: string[];
};
