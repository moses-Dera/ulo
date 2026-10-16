import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ụlọ — Curated Campus Living | UNN Student Hostels",
  description:
    "Direct room reservations in verified student hostels across Behind Flat, Hilltop, Odim Gate, and Green House at the University of Nigeria, Nsukka.",
  keywords: [
    "UNN hostels",
    "Nsukka student accommodation",
    "Behind Flat lodges",
    "Hilltop lodges UNN",
    "Ụlọ",
    "verified landlords UNN",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
