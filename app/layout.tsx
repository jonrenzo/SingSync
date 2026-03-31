import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SingSync — Karaoke",
  description: "Your personal karaoke machine. Search, queue, and sing your favorite songs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
