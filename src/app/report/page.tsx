import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ReportForm } from "@/components/report/ReportForm";

export const metadata: Metadata = {
  title: "Report a Problematic Lodge — Ụlọ | UNN Campus Housing Integrity",
  description:
    "Report fraudulent middleman agents, unapproved rent hikes, or severe amenity failures in UNN off-campus student accommodation.",
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex-1">
        <Suspense fallback={<div className="text-center font-mono text-xs text-[#5A5A58] py-12">Loading safety reporting portal...</div>}>
          <ReportForm />
        </Suspense>
      </main>
      <Suspense fallback={<footer className="bg-[#121212] text-[#E8E5DF] border-t border-white/10 pt-16 pb-12" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
