"use client";

import { BookOpen, Mail, Save, Upload, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Button,
  ButtonLink,
  Field,
  FieldError,
  Input,
  Label,
} from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useExchangeRequests, useMyBooks } from "@/hooks";
import { routes } from "@/lib/routes";
import type { ExchangeRequest } from "@/types";
import { readCompressedImage } from "@/utils/images/readCompressedImage";
import { updateCurrentUserProfile } from "./userService";

type ProfileFormState = {
  name: string;
  email: string;
  avatarUrl: string;
};

type ProfileFormDraft = {
  profileId: string;
  values: ProfileFormState;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("requires-recent-login")) {
      return "Please log in again before changing your email.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatRequestDate(request: ExchangeRequest) {
  const date = request.createdAt?.toDate?.();

  if (!date) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ProfileManager() {
  const { user, profile, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const [formDraft, setFormDraft] = useState<ProfileFormDraft | null>(null);
  const { books } = useMyBooks(profile?.id);
  const {
    error: exchangeRequestsError,
    isLoading: isExchangeRequestsLoading,
    requests: exchangeRequests,
    updateRequestStatus,
    updatingRequestId,
  } = useExchangeRequests(profile?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const incomingRequestsCount = useMemo(() => {
    if (!profile) {
      return 0;
    }

    return exchangeRequests.filter((request) => request.ownerId === profile.id)
      .length;
  }, [exchangeRequests, profile]);

  const formState =
    profile && formDraft?.profileId === profile.id
      ? formDraft.values
      : {
          avatarUrl: profile?.avatarUrl || "",
          email: profile?.email || "",
          name: profile?.name || "",
        };

  function updateFormState(nextValues: ProfileFormState) {
    if (!profile) {
      return;
    }

    setFormDraft({
      profileId: profile.id,
      values: nextValues,
    });
  }

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    readCompressedImage(file)
      .then((compressedImage) => {
        updateFormState({
          ...formState,
          avatarUrl: compressedImage,
        });
        setAvatarFileName(file.name);
        setError("");
      })
      .catch(() => {
        setAvatarFileName("");
        setError("Could not process the selected avatar image.");
      });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      await updateCurrentUserProfile({
        authUser: user,
        profile: formState,
      });
      await refreshProfile();
      setFormDraft(null);
      setAvatarFileName("");
      setSuccessMessage("Profile updated.");
    } catch (profileError) {
      setError(getErrorMessage(profileError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestStatusChange(
    requestId: string,
    status: "accepted" | "rejected",
  ) {
    setError("");

    try {
      await updateRequestStatus(requestId, status);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12 text-white">
        Loading profile...
      </main>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center text-white">
        <h1 className="font-serif text-4xl">Profile</h1>
        <p className="text-zinc-400">
          Log in to manage your profile and exchange requests.
        </p>
        <ButtonLink href={routes.login}>Log in</ButtonLink>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 text-white">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="font-serif text-4xl">Profile</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Manage your account details and keep track of your book exchange
          activity.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-zinc-800 p-5"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-zinc-950">
              {formState.avatarUrl ? (
                <Image
                  src={formState.avatarUrl}
                  alt={formState.name}
                  className="size-full object-cover"
                  height={80}
                  unoptimized
                  width={80}
                />
              ) : (
                <span className="font-serif text-2xl">
                  {getInitials(formState.name) || (
                    <UserRound className="size-7" />
                  )}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-serif text-2xl">{profile.name}</h2>
              <p className="text-sm text-zinc-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid gap-5">
            <Field>
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={formState.name}
                onChange={(event) =>
                  updateFormState({
                    ...formState,
                    name: event.target.value,
                  })
                }
                placeholder="Your name"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  updateFormState({
                    ...formState,
                    email: event.target.value,
                  })
                }
                placeholder="you@example.com"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="profile-avatar">Avatar</Label>
              <label
                htmlFor="profile-avatar"
                className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-white bg-black px-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Upload size={18} />
                  <span className="truncate">
                    {avatarFileName || "Choose image file"}
                  </span>
                </span>
                <span className="shrink-0 text-xs opacity-70">Browse</span>
              </label>
              <input
                accept="image/*"
                className="sr-only"
                id="profile-avatar"
                onChange={handleAvatarFileChange}
                type="file"
              />
            </Field>
          </div>

          {error ? <FieldError className="mt-5">{error}</FieldError> : null}
          {successMessage ? (
            <p className="mt-5 text-sm text-emerald-300">{successMessage}</p>
          ) : null}

          <Button type="submit" className="mt-7" disabled={isSaving}>
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-md border border-zinc-800 p-5">
            <div className="mb-4 flex items-center gap-3 text-zinc-300">
              <BookOpen className="size-5" />
              <span className="text-sm uppercase tracking-[0.2em]">Library</span>
            </div>
            <p className="font-serif text-5xl">{books.length}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {books.length === 1 ? "book added" : "books added"}
            </p>
          </div>

          <div className="rounded-md border border-zinc-800 p-5">
            <div className="mb-4 flex items-center gap-3 text-zinc-300">
              <Mail className="size-5" />
              <span className="text-sm uppercase tracking-[0.2em]">Requests</span>
            </div>
            <p className="font-serif text-5xl">{incomingRequestsCount}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {incomingRequestsCount === 1
                ? "incoming exchange request"
                : "incoming exchange requests"}
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl">Exchange requests</h2>
          {isExchangeRequestsLoading ? (
            <span className="text-sm text-zinc-500">Loading...</span>
          ) : null}
        </div>

        {exchangeRequestsError ? (
          <FieldError>{exchangeRequestsError}</FieldError>
        ) : null}

        {exchangeRequests.length > 0 ? (
          <div className="divide-y divide-zinc-800 border-y border-zinc-800">
            {exchangeRequests.map((request) => {
              const isIncomingRequest = request.ownerId === profile.id;

              return (
                <article
                  key={request.id}
                  className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                      {isIncomingRequest ? "Incoming" : "Outgoing"}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl">
                      {request.bookName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {isIncomingRequest
                        ? `${request.requesterName} wants to exchange books with you.`
                        : `You sent an exchange request to ${request.ownerEmail}.`}
                    </p>
                    {request.offeredBooks.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                          Offered books
                        </p>
                        <ul className="mt-2 grid gap-2">
                          {request.offeredBooks.map((offeredBook) => (
                            <li
                              key={offeredBook.id}
                              className="overflow-hidden rounded-md border border-zinc-800 text-sm text-zinc-300 transition-colors hover:border-white"
                            >
                              <Link
                                className="block px-3 py-2 transition-colors hover:bg-white hover:!text-black"
                                href={routes.bookDetails(offeredBook.id)}
                              >
                                <span className="font-medium">
                                  {offeredBook.name}
                                </span>{" "}
                                by {offeredBook.author}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {isIncomingRequest ? (
                      <a
                        href={`mailto:${request.requesterEmail}`}
                        className="mt-3 inline-flex text-sm text-white underline-offset-4 hover:underline"
                      >
                        {request.requesterEmail}
                      </a>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-4 md:items-end md:justify-between">
                    <div className="flex items-start gap-3 md:justify-end">
                      <span className="rounded-md border border-zinc-700 px-3 py-2 text-sm capitalize text-zinc-300">
                        {request.status}
                      </span>
                      <span className="px-1 py-2 text-sm text-zinc-500">
                        {formatRequestDate(request)}
                      </span>
                    </div>

                    {isIncomingRequest && request.status === "pending" ? (
                      <div className="flex gap-2 md:mt-auto md:justify-end">
                        <Button
                          className="h-10 w-10 px-0 text-xl leading-none"
                          disabled={updatingRequestId === request.id}
                          onClick={() =>
                            handleRequestStatusChange(request.id, "accepted")
                          }
                          title="Accept request"
                        >
                          <span aria-hidden="true">{"\u2713"}</span>
                        </Button>
                        <Button
                          className="h-10 w-10 px-0 text-2xl leading-none"
                          disabled={updatingRequestId === request.id}
                          onClick={() =>
                            handleRequestStatusChange(request.id, "rejected")
                          }
                          title="Reject request"
                          variant="danger"
                        >
                          <span aria-hidden="true">{"\u00d7"}</span>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-zinc-800 p-6 text-sm text-zinc-400">
            No exchange requests yet.
          </div>
        )}
      </section>
    </main>
  );
}
