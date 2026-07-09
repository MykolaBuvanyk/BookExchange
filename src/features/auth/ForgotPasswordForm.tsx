"use client";

import { FirebaseError } from "firebase/app";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import {
  Button,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
} from "@/components/ui";
import { routes } from "@/lib/routes";
import { sendPasswordReset } from "./authService";

type ForgotPasswordFormState = {
  email: string;
};

const initialFormState: ForgotPasswordFormState = {
  email: "",
};

function getFirebaseResetError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Could not send the reset email. Please try again.";
  }

  if (error.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  return "Could not send the reset email. Check your email and try again.";
}

function validateForgotPasswordForm(form: ForgotPasswordFormState) {
  if (!form.email.trim()) {
    return "Enter your email.";
  }

  return null;
}

export function ForgotPasswordForm() {
  const [form, setForm] = useState<ForgotPasswordFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof ForgotPasswordFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForgotPasswordForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await sendPasswordReset(form.email.trim());
      setIsEmailSent(true);
    } catch (resetError) {
      setError(getFirebaseResetError(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEmailSent) {
    return (
      <div className="space-y-5 rounded-md border border-white/20 p-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-white">
            Check your email
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            If an account exists for{" "}
            <span className="text-white">{form.email}</span>, Firebase has sent
            password reset instructions.
          </p>
        </div>

        <Button className="w-full" onClick={() => setIsEmailSent(false)}>
          Send another email
        </Button>

        <FieldHint className="text-center">
          Ready to sign in?{" "}
          <Link
            className="text-white underline underline-offset-4"
            href={routes.login}
          >
            Back to login
          </Link>
        </FieldHint>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={updateField("email")}
          placeholder="you@example.com"
        />
      </Field>

      {error ? <FieldError>{error}</FieldError> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset email"}
      </Button>

      <FieldHint className="text-center">
        Remembered your password?{" "}
        <Link
          className="text-white underline underline-offset-4"
          href={routes.login}
        >
          Login
        </Link>
      </FieldHint>
    </form>
  );
}
