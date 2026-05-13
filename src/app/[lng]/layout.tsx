import { notFound } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { LANGUAGES, isLng } from "@/lib/domain/Lng";

export function generateStaticParams() {
  return LANGUAGES.map((lng) => ({ lng }));
}

export default async function LngLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  if (!isLng(lng)) notFound();

  return (
    <>
      <Nav lng={lng} />
      <main className="flex-1 px-4 py-6">{children}</main>
    </>
  );
}
