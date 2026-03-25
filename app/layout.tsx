import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG-Refine | LLM Data Cleanup",
  description: "Landing page for RAG-Refine, high-fidelity data ingestion for LLMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-on-surface selection:bg-primary/30">
        {children}
        <Toaster theme="dark" position="bottom-right" />
        <Analytics/>
      </body>
    </html>
  );
}
