"use client";

import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { loginUser } from "./authService";

type LoginFormState = {
  email: string;
  password: string;
};

const initialFormState: LoginFormState = {
  email: "",
  password: "",
};

function getFirebaseLoginError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Could not sign you in. Please try again.";
  }

  if (
    error.code === "auth/invalid-credential" ||
    error.code === "auth/user-not-found" ||
    error.code === "auth/wrong-password"
  ) {
    return "Invalid email or password.";
  }

  if (error.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  return "Could not sign you in. Check your details and try again.";
}

function validateLoginForm(form: LoginFormState) {
  if (!form.email.trim()) {
    return "Enter your email.";
  }

  if (!form.password) {
    return "Enter your password.";
  }

  return null;
}

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof LoginFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateLoginForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      router.push(routes.myBooks);
    } catch (loginError) {
      setError(getFirebaseLoginError(loginError));
    } finally {
      setIsSubmitting(false);
    }
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

      <Field>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-sm text-zinc-300 underline underline-offset-4 transition-colors hover:text-white"
            href={routes.forgotPassword}
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={updateField("password")}
          placeholder="Your password"
        />
      </Field>

      {error ? <FieldError>{error}</FieldError> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Login"}
      </Button>

      <FieldHint className="text-center">
        Do not have an account?{" "}
        <Link
          className="text-white underline underline-offset-4"
          href={routes.register}
        >
          Create one
        </Link>
      </FieldHint>
    </form>
  );
}
