import { VocabularyView } from "@/components/vocabulary/VocabularyView";
import { loadVocabulary } from "@/lib/storage/GitHubStorage";

export default async function WordsPage() {
  const file = await loadVocabulary();
  return <VocabularyView initial={file.entries} kind="word" />;
}
