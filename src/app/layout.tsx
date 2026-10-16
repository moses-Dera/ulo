import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
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
      className={`${plusJakartaSans.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">{children}</body>
    </html>
  );
}
