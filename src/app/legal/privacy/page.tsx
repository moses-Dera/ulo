import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { HiShieldCheck, HiOutlineArrowLeft, HiOutlineLockClosed } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Privacy Policy & NDPA Compliance — Ụlọ | UNN Campus Living",
  description:
    "Official Data Privacy Charter for Ụlọ Technologies under the Nigeria Data Protection Act (NDPA 2023). Protecting student identity and verified landlord records.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#5A5A58] hover:text-[#121212] transition-colors mb-3"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Directory</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-mono tracking-wider uppercase text-[#1E513A] font-semibold bg-[#EBF3EE] px-2.5 py-0.5 rounded-sm">
              <HiShieldCheck className="w-3.5 h-3.5 text-[#1E513A]" />
              NDPA 2023 COMPLIANT
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121212]">
            Privacy Policy & Data Protection Charter
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A58] mt-2 font-sans">
            Effective Date: October 2026 • University of Nigeria, Nsukka Campus Housing Network
          </p>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs space-y-8 text-sm text-[#5A5A58] leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              1. Our Foundational Commitment
            </h2>
            <p>
              Ụlọ Technologies (“Ụlọ”, “we”, “our”) operates as a dedicated student housing verification and direct-connection infrastructure for the University of Nigeria, Nsukka (UNN). We believe student accommodation search should be safe, transparent, and completely free from extortionate middleman syndicates. This Privacy Policy details how we collect, safeguard, and process personal data in full compliance with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              2. Information We Collect & Why
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-[#121212] text-xs font-mono uppercase tracking-wider mb-1">
                  A. For UNN Students
                </h3>
                <p>
                  To secure a free 72-hour room hold without paying agent inspection fees, we collect your full legal name, active telephone number, academic faculty/department, and university matriculation/registration number. This data is strictly used to verify student enrollment and prevent fraudulent automated room hoarding.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#121212] text-xs font-mono uppercase tracking-wider mb-1">
                  B. For Property Owners & Landlords
                </h3>
                <p>
                  To receive the “VERIFIED LODGE” safety audit badge, landlords must submit their National Identity Number (NIN), phone number, and physical property conveyance deed. This data is reviewed manually by our platform moderation officers and is never disclosed to students or unauthorized third parties.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              3. The 72-Hour Hold Protocol & Data Disclosure
            </h2>
            <p>
              When a student places a 72-hour reservation hold on an available room:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The landlord sees the student’s name, department, and reservation details in their occupancy ledger.</li>
              <li>Direct telephone lines and exact compound physical directions are released <em>only</em> upon landlord booking approval.</li>
              <li>If a booking is not confirmed within 72 hours, the reservation hold expires automatically, and contact credentials are sealed.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              4. Zero Commercial Exploitation
            </h2>
            <p>
              <strong>We do not sell, rent, monetize, or trade student personal records</strong> to third-party marketing firms, commercial banks, or unlicensed housing agents. Your information is used strictly to facilitate campus accommodation and safety dispute resolution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              5. Data Security & Storage
            </h2>
            <p>
              All user records, passwords, and sessions are encrypted using industry-standard AES-256 and Argon2 password hashing. Database transactions are isolated on secure relational infrastructure with restricted administrative access audit logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              6. Your Rights Under the NDPA 2023
            </h2>
            <p>
              Under Nigerian data protection law, you possess the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Request an extract of all personal data held concerning your account.</li>
              <li>Request correction or rectification of outdated contact or student status information.</li>
              <li>Request complete account deletion and erasure of historical reservation records upon graduation or lease termination.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#E8E5DF]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              7. Contact Our Data Protection Officer
            </h2>
            <p>
              For privacy inquiries, audit requests, or campus housing security liaison matters, reach our team directly:
            </p>
            <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-xs font-mono space-y-1 text-[#121212]">
              <p>Email: <span className="font-semibold text-[#C25E38]">privacy@ulo.ng</span></p>
              <p>Helpline: <span className="font-semibold">0800-856-4357 (0800-ULO-HELP)</span></p>
              <p>Physical Liaison: Franco Extension Road, Nsukka, Enugu State, Nigeria</p>
            </div>
          </section>
        </div>
      </main>

      <Suspense fallback={<footer className="bg-[#121212] text-[#E8E5DF] border-t border-white/10 pt-16 pb-12" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
