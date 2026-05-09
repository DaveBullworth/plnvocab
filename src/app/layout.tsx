import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "@/components/auth/AdminProvider";
import { getAdminFromCookies } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Polish Vocabulary Trainer",
  description: "A small educational project to help learn the Polish language",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await getAdminFromCookies();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AdminProvider isAdmin={isAdmin}>{children}</AdminProvider>
      </body>
    </html>
  );
}
