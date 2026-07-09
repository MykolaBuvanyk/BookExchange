import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md">
        <h1 className="font-serif text-4xl font-semibold text-white">
          Create account
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          Join BookExchange to add your books and request swaps with other
          readers.
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
