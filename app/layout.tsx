import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Studio | Multi-agent creative production workspace",
  description: "Orchestrate specialized GPT agents through a visible creative production pipeline.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
