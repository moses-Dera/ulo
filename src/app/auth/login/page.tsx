import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Ụlọ | UNN Student & Landlord Portal",
  description: "Sign in to track your UNN hostel reservations or manage your landlord property listings.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />
      <main className="pt-28 pb-16 px-4 flex items-center justify-center flex-1">
        <Suspense fallback={<div className="text-center font-mono text-xs text-[#5A5A58]">Loading login portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Suspense fallback={<footer className="bg-[#121212] text-[#E8E5DF] border-t border-white/10 pt-16 pb-12" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
