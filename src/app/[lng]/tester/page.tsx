import { notFound } from "next/navigation";
import { isLng } from "@/lib/domain/Lng";
import { TesterView } from "@/components/tester/TesterView";

export default async function TesterPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  if (!isLng(lng)) notFound();

  return <TesterView lng={lng} />;
}
