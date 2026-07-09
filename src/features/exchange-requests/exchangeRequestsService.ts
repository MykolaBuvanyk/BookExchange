import emailjs from "@emailjs/browser";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { emailJsEnv } from "@/lib/env";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import type {
  Book,
  ExchangeRequest,
  ExchangeRequestOfferedBook,
  ExchangeRequestStatus,
  UserProfile,
} from "@/types";

type CreateExchangeRequestParams = {
  book: Book;
  requester: UserProfile;
  requesterBooks: Book[];
};

type SendExchangeRequestEmailParams = {
  book: Book;
  requester: UserProfile;
  requesterBooks: Book[];
};

export async function createExchangeRequest({
  book,
  requester,
  requesterBooks,
}: CreateExchangeRequestParams) {
  const requestReference = doc(collection(db, collections.exchangeRequests));
  const offeredBooks = mapOfferedBooks(requesterBooks);

  await setDoc(requestReference, {
    id: requestReference.id,
    bookId: book.id,
    bookName: book.name,
    ownerId: book.ownerId,
    ownerEmail: book.ownerEmail,
    requesterId: requester.id,
    requesterName: requester.name,
    requesterEmail: requester.email,
    requesterBookIds: offeredBooks.map((offeredBook) => offeredBook.id),
    offeredBooks,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function mapOfferedBooks(requesterBooks: Book[]): ExchangeRequestOfferedBook[] {
  return requesterBooks.map((requesterBook) => ({
    author: requesterBook.author,
    id: requesterBook.id,
    name: requesterBook.name,
  }));
}

function getEmailJsConfig() {
  if (!emailJsEnv.serviceId || !emailJsEnv.templateId || !emailJsEnv.publicKey) {
    throw new Error("EmailJS is not configured.");
  }

  return {
    publicKey: emailJsEnv.publicKey,
    serviceId: emailJsEnv.serviceId,
    templateId: emailJsEnv.templateId,
  };
}

function formatOfferedBooks(requesterBooks: Book[]) {
  return requesterBooks
    .map((requesterBook, index) => {
      return `${index + 1}. ${requesterBook.name} - ${requesterBook.author}`;
    })
    .join("\n");
}

export async function sendExchangeRequestEmail({
  book,
  requester,
  requesterBooks,
}: SendExchangeRequestEmailParams) {
  const emailJsConfig = getEmailJsConfig();

  await emailjs.send(
    emailJsConfig.serviceId,
    emailJsConfig.templateId,
    {
      offered_books: formatOfferedBooks(requesterBooks),
      reply_to: requester.email,
      requested_book: book.name,
      requested_book_author: book.author,
      requester_email: requester.email,
      requester_name: requester.name,
      to_email: book.ownerEmail,
      to_name: book.ownerName,
    },
    {
      publicKey: emailJsConfig.publicKey,
    },
  );
}

function mapExchangeRequestDocument(
  document: QueryDocumentSnapshot<DocumentData>,
): ExchangeRequest {
  const data = document.data();

  return {
    id: document.id,
    bookId: data.bookId,
    bookName: data.bookName,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    requesterId: data.requesterId,
    requesterName: data.requesterName,
    requesterEmail: data.requesterEmail,
    requesterBookIds: data.requesterBookIds,
    offeredBooks: data.offeredBooks || [],
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateExchangeRequestStatus(
  requestId: string,
  status: Extract<ExchangeRequestStatus, "accepted" | "rejected">,
) {
  await updateDoc(doc(db, collections.exchangeRequests, requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function sortExchangeRequests(requests: ExchangeRequest[]) {
  return [...requests].sort((firstRequest, secondRequest) => {
    const firstDate = firstRequest.createdAt?.toMillis?.() ?? 0;
    const secondDate = secondRequest.createdAt?.toMillis?.() ?? 0;

    return secondDate - firstDate;
  });
}

export async function fetchUserExchangeRequests(userId: string) {
  const exchangeRequestsReference = collection(db, collections.exchangeRequests);
  const [incomingSnapshot, outgoingSnapshot] = await Promise.all([
    getDocs(
      query(exchangeRequestsReference, where("ownerId", "==", userId)),
    ),
    getDocs(
      query(exchangeRequestsReference, where("requesterId", "==", userId)),
    ),
  ]);

  const requestsById = new Map<string, ExchangeRequest>();

  incomingSnapshot.docs
    .map(mapExchangeRequestDocument)
    .forEach((request) => requestsById.set(request.id, request));

  outgoingSnapshot.docs
    .map(mapExchangeRequestDocument)
    .forEach((request) => requestsById.set(request.id, request));

  return sortExchangeRequests(Array.from(requestsById.values()));
}
