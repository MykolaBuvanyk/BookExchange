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
import { registerUser } from "./authService";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getFirebaseRegisterError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Could not create your account. Please try again.";
  }

  if (error.code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }

  if (error.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (error.code === "auth/weak-password") {
    return "Password must contain at least 6 characters.";
  }

  return "Could not create your account. Check your details and try again.";
}

function validateRegisterForm(form: RegisterFormState) {
  if (!form.name.trim()) {
    return "Enter your name.";
  }

  if (!form.email.trim()) {
    return "Enter your email.";
  }

  if (form.password.length < 6) {
    return "Password must contain at least 6 characters.";
  }

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof RegisterFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }));
    };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateRegisterForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      router.push(routes.myBooks);
    } catch (registerError) {
      setError(getFirebaseRegisterError(registerError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          value={form.name}
          onChange={updateField("name")}
          placeholder="Jane Reader"
        />
      </Field>

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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={updateField("password")}
          placeholder="At least 6 characters"
        />
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          placeholder="Repeat your password"
        />
      </Field>

      {error ? <FieldError>{error}</FieldError> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <FieldHint className="text-center">
        Already have an account?{" "}
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
