import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md">
        <h1 className="font-serif text-4xl font-semibold text-white">Login</h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          Sign in to manage your books and send exchange requests.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
