import { VocabularyView } from "@/components/vocabulary/VocabularyView";
import { loadVocabulary } from "@/lib/storage/GitHubStorage";

export default async function PhrasesPage() {
  const file = await loadVocabulary();
  return <VocabularyView initial={file.entries} kind="phrase" />;
}
