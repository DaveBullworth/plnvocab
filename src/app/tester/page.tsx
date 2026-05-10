import { TesterView } from "@/components/tester/TesterView";
import { loadVocabulary } from "@/lib/storage/GitHubStorage";

export default async function TesterPage() {
  const file = await loadVocabulary();
  return <TesterView entries={file.entries} />;
}
