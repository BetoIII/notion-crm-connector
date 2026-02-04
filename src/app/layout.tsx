import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion CRM Connector",
  description: "Create and manage personal CRMs in your Notion workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
