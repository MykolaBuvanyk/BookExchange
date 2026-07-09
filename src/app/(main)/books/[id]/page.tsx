import { PagePlaceholder } from "@/components/layout";

type BookDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const { id } = await params;

  return (
    <PagePlaceholder
      title="Book details"
      description={`Book details page placeholder for book id: ${id}.`}
    />
  );
}
