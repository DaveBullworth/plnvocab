import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polish Vocabulary Trainer",
  description: "A small educational project to help learn the Polish language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
