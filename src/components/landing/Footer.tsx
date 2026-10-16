"use client";

import React from "react";
import Link from "next/link";
import { HiShieldCheck } from "react-icons/hi2";

export function Footer() {
  return (
    <footer className="bg-[#121212] text-[#E8E5DF] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EE] flex items-center justify-center text-[#121212]">
                <span className="font-serif text-lg font-bold text-[#121212]">Ụ</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none">
                Ụlọ<span className="text-[#C25E38]">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#E8E5DF]/70 max-w-sm leading-relaxed">
              Curated off-campus student accommodation for the University of Nigeria, Nsukka (UNN).
              Connecting students directly with verified property owners.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#E8E5DF]/60">
              <HiShieldCheck className="w-4 h-4 text-[#C25E38]" />
              <span>Compliant with Nigerian Data Protection Act (NDPA 2023)</span>
            </div>
          </div>

          {/* Zones */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-white mb-4">
              Nsukka Lodging Zones
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8E5DF]/70">
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Behind Flat (Second Gate)
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Hilltop & Ofulonu
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Odim Gate
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Green House
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Umunkaka
                </a>
              </li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-white mb-4">
              Students
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8E5DF]/70">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=student" className="hover:text-white transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-white transition-colors">
                  My Reservation Tracker
                </Link>
              </li>
              <li>
                <a href="#gates" className="hover:text-white transition-colors">
                  Campus Gate Proximity Map
                </a>
              </li>
              <li>
                <Link href="/report" className="hover:text-white transition-colors text-[#C25E38]">
                  Report a Problematic Lodge
                </Link>
              </li>
            </ul>
          </div>

          {/* Landlords & Platform */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-white mb-4">
              Landlords
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8E5DF]/70">
              <li>
                <Link href="/auth/register?role=landlord" className="hover:text-white transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Landlord Dashboard
                </Link>
              </li>
              <li>
                <a href="#standard" className="hover:text-white transition-colors">
                  Verification Guidelines
                </a>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8E5DF]/50">
          <div>
            © {new Date().getFullYear()} Ụlọ Technologies. Curated campus living for UNN. All rights reserved.
          </div>
          <div>
            Built with respect for the University of Nigeria student community.
          </div>
        </div>
      </div>
    </footer>
  );
}
