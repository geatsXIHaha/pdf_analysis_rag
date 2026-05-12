import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Assistant",
  description: "AI-powered PDF assistant"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-canvas text-ink">{children}</body>
    </html>
  );
}
