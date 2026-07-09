import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16 text-white">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p className="mb-5 text-sm uppercase tracking-[0.28em] text-zinc-500">
          Read. Share. Exchange.
        </p>
        <h1 className="font-serif text-6xl leading-none md:text-8xl">
          BookExchange
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
          Find your next story by trading books with readers who are ready to
          pass theirs on.
        </p>
        <ButtonLink href={routes.books} className="mt-9" size="lg">
          Find books
          <ArrowRight className="size-5" />
        </ButtonLink>
      </section>
    </main>
  );
}
