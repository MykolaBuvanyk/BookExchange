type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>
      </section>
    </main>
  );
}
