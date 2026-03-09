import { BookPageClient } from "@/components/book-page-client";

type BookPageProps = {
  searchParams?: Promise<{ serviceId?: string }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;

  return <BookPageClient selectedServiceId={params?.serviceId} />;
}
