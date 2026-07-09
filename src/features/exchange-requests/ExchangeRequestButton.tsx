"use client";

import { ChevronDown, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useExchangeOfferBooks } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";
import {
  createExchangeRequest,
  sendExchangeRequestEmail,
} from "./exchangeRequestsService";

type ExchangeRequestButtonProps = {
  book: Book;
};

export function ExchangeRequestButton({ book }: ExchangeRequestButtonProps) {
  const { profile, user } = useAuth();
  const {
    books: requesterBooks,
    error: booksError,
    isLoading: isLoadingBooks,
    loadBooks,
    resetSelection,
    selectedBookIds,
    selectedBooks,
    setError: setBooksError,
    toggleBookSelection,
  } = useExchangeOfferBooks(user?.uid);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggleOpen() {
    if (!user || !profile) {
      setError("Login to request an exchange.");
      return;
    }

    if (book.ownerId === user.uid) {
      setError("You cannot request an exchange for your own book.");
      return;
    }

    setError(null);
    setBooksError(null);
    setSuccessMessage(null);
    setIsOpen((currentValue) => !currentValue);
    await loadBooks();
  }

  async function handleRequestExchange() {
    if (!user || !profile) {
      setError("Login to request an exchange.");
      return;
    }

    if (selectedBooks.length === 0) {
      setError("Choose at least one book to offer.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createExchangeRequest({
        book,
        requester: profile,
        requesterBooks: selectedBooks,
      });

      await sendExchangeRequestEmail({
        book,
        requester: profile,
        requesterBooks: selectedBooks,
      });

      resetSelection();
      setIsOpen(false);
      setSuccessMessage("Exchange request has been sent.");
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "Could not send exchange request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative space-y-3">
      <Button
        className="w-full sm:w-fit"
        disabled={isSubmitting || isLoadingBooks}
        onClick={handleToggleOpen}
        size="lg"
      >
        {isLoadingBooks ? "Loading books..." : "Request exchange"}
        <ChevronDown
          className={cn(
            "size-5 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {isOpen ? (
        <div className="w-full rounded-md border border-white/20 bg-black p-4 shadow-2xl shadow-black sm:max-w-xl">
          <p className="mb-3 text-sm text-zinc-400">
            Choose books from your library to offer for this exchange.
          </p>

          {requesterBooks.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {requesterBooks.map((requesterBook) => {
                const isSelected = selectedBookIds.includes(requesterBook.id);

                return (
                  <label
                    key={requesterBook.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                      isSelected
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white hover:border-white",
                    )}
                  >
                    <input
                      checked={isSelected}
                      className="mt-1 size-4 accent-black"
                      onChange={() => toggleBookSelection(requesterBook.id)}
                      type="checkbox"
                    />
                    <span className="min-w-0">
                      <span className="block font-serif text-lg leading-6">
                        {requesterBook.name}
                      </span>
                      <span
                        className={cn(
                          "block text-sm",
                          isSelected ? "text-zinc-700" : "text-zinc-400",
                        )}
                      >
                        {requesterBook.author}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-white/20 p-4 text-sm text-zinc-400">
              Add at least one book before requesting an exchange.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {selectedBooks.length} selected
            </p>
            <Button
              disabled={isSubmitting || selectedBooks.length === 0}
              onClick={handleRequestExchange}
            >
              <Send className="size-4" />
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </div>
        </div>
      ) : null}

      {error || booksError ? (
        <p className="text-sm text-red-300">{error || booksError}</p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-emerald-300">{successMessage}</p>
      ) : null}
    </div>
  );
}
