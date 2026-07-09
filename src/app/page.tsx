export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Next.js + TypeScript + Tailwind + Firebase
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          BookExchange
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600">
          Project scaffold is ready for Authentication and Firestore features.
        </p>
      </section>
    </main>
  );
}
