import { notFound } from "next/navigation";
import { isLng } from "@/lib/domain/Lng";
import { VocabularyView } from "@/components/vocabulary/VocabularyView";

export default async function PhrasesPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  if (!isLng(lng)) notFound();

  return <VocabularyView lng={lng} isWord={false} />;
}
