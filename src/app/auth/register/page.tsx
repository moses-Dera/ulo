import React, { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Ụlọ | UNN Student & Landlord Portal",
  description: "Register your UNN student account to reserve off-campus hostels, or register your property as a verified Nsukka landlord.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />
      <main className="pt-28 pb-16 px-4 flex items-center justify-center flex-1">
        <Suspense fallback={<div className="text-center font-mono text-xs text-[#5A5A58]">Loading registration portal...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
      <Suspense fallback={<footer className="bg-[#121212] text-[#E8E5DF] border-t border-white/10 pt-16 pb-12" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
