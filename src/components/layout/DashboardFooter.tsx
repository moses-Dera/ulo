import React from "react";
import Link from "next/link";
import { HiShieldCheck, HiOutlinePhone, HiOutlineBuildingOffice } from "react-icons/hi2";

export function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-[#E8E5DF] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E8E5DF]">
          {/* Col 1: Identity & Guarantee */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[#121212]">Ụlọ.</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E38] font-semibold">
                Campus Living
              </span>
            </div>
            <p className="text-xs text-[#5A5A58] leading-relaxed">
              Curated, verified student accommodation for the University of Nigeria, Nsukka. Eliminating illegal agency fees and fake caretakers.
            </p>
          </div>

          {/* Col 2: UNN Campus Network */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-[#121212]">Campus Zones</h4>
            <ul className="text-xs text-[#5A5A58] space-y-1.5 font-sans">
              <li><Link href="/#explore" className="hover:text-[#121212]">Behind Flat (Second Gate)</Link></li>
              <li><Link href="/#explore" className="hover:text-[#121212]">Hilltop (Engineering)</Link></li>
              <li><Link href="/#explore" className="hover:text-[#121212]">Odim Gate (Medical & Vet)</Link></li>
              <li><Link href="/#explore" className="hover:text-[#121212]">Green House & Ofulonu</Link></li>
            </ul>
          </div>

          {/* Col 3: Safety & Verification */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-[#121212]">Platform Standards</h4>
            <ul className="text-xs text-[#5A5A58] space-y-1.5 font-sans">
              <li><Link href="/#standard" className="hover:text-[#121212]">The Ụlọ 72-Hour Hold Standard</Link></li>
              <li><Link href="/landlord/verification" className="hover:text-[#121212]">Landlord NIN & Deed Audit</Link></li>
              <li><Link href="/#standard" className="hover:text-[#121212]">0% Middleman Commission Charter</Link></li>
              <li><Link href="/auth/login" className="hover:text-[#121212]">UNN Student Login</Link></li>
            </ul>
          </div>

          {/* Col 4: Emergency Assistance */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-[#121212]">Support & Safety</h4>
            <p className="text-xs text-[#5A5A58]">
              Emergency accommodation dispute or middleman reporting line:
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1E513A] pt-1">
              <HiOutlinePhone className="w-4 h-4 text-[#1E513A]" />
              <span>0800-856-4357 (0800-ULO-HELP)</span>
            </div>
            <p className="text-[10.5px] font-mono text-[#5A5A58]">
              Nsukka Campus Security Liaison: Active
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#5A5A58]">
          <div suppressHydrationWarning>
            &copy; 2026 Ụlọ Technologies. Curated campus living for UNN. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[10.5px] font-mono uppercase tracking-wider">
            <Link href="/" className="hover:text-[#121212]">Public Directory</Link>
            <span>•</span>
            <Link href="/dashboard/bookings" className="hover:text-[#121212]">Student Portal</Link>
            <span>•</span>
            <Link href="/landlord/dashboard" className="hover:text-[#121212]">Landlord Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
