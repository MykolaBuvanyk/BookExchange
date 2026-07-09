import { ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md">
        <h1 className="font-serif text-4xl font-semibold text-white">
          Reset password
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          Enter your account email and we will send a password reset link.
        </p>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
