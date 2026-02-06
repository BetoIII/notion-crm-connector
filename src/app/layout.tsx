import type { Metadata } from "next";
import { Courier_Prime, IBM_Plex_Mono } from 'next/font/google';
import "./globals.css";

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-heading'
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body'
});

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
      <body className={`${courierPrime.variable} ${ibmPlexMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
