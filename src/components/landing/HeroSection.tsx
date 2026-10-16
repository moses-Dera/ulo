"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiShieldCheck, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { RiWalkLine, RiShieldCheckLine, RiDropLine } from "react-icons/ri";

interface HeroSectionProps {
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  selectedGate: string;
  onGateSelect: (gate: string) => void;
  maxRent: number | "";
  onMaxRentChange: (rent: number | "") => void;
  onSearchSubmit: () => void;
}

export function HeroSection({
  selectedZone,
  onZoneSelect,
  selectedGate,
  onGateSelect,
  maxRent,
  onMaxRentChange,
  onSearchSubmit,
}: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Editorial Micro-Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E513A]/10 border border-[#1E513A]/20 text-[#1E513A] text-xs font-semibold tracking-wider uppercase mb-6"
          >
            <HiShieldCheck className="w-4 h-4 text-[#1E513A]" />
            <span>UNN Nsukka Off-Campus Directory</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121212] leading-[1.12]"
          >
            Curated campus living,{" "}
            <span className="italic font-normal text-[#C25E38]">without the agent runaround.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-[#5A5A58] max-w-2xl leading-relaxed"
          >
            Reserve verified student lodges across Behind Flat, Hilltop, Odim Gate, and Green House.
            Direct contact with verified landlords, real walking times to UNN gates, and zero commission markups.
          </motion.p>

          {/* Search & Filter Island */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full mt-10 p-3 sm:p-4 rounded-3xl bg-white border border-[#E8E5DF] shadow-md shadow-black/[0.03]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {/* Zone Selector */}
              <div className="p-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E5DF]/60 hover:border-[#C25E38]/40 transition-colors">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A5A58] mb-1">
                  Lodging Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => onZoneSelect(e.target.value)}
                  className="w-full bg-transparent font-medium text-sm text-[#121212] focus:outline-none cursor-pointer"
                >
                  <option value="">All Nsukka Zones</option>
                  <option value="Behind Flat">Behind Flat (Second Gate)</option>
                  <option value="Hilltop">Hilltop (Engineering)</option>
                  <option value="Odim Gate">Odim Gate (Medical / Vet)</option>
                  <option value="Green House">Green House</option>
                  <option value="Ofulonu">Ofulonu</option>
                  <option value="Umunkaka">Umunkaka</option>
                </select>
              </div>

              {/* Campus Gate Selector */}
              <div className="p-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E5DF]/60 hover:border-[#C25E38]/40 transition-colors">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A5A58] mb-1">
                  Nearest UNN Gate
                </label>
                <select
                  value={selectedGate}
                  onChange={(e) => onGateSelect(e.target.value)}
                  className="w-full bg-transparent font-medium text-sm text-[#121212] focus:outline-none cursor-pointer"
                >
                  <option value="">Any Campus Gate</option>
                  <option value="Second Gate">Second Gate (Behind Flat)</option>
                  <option value="Hilltop Gate">Hilltop Gate (Hilltop / Ofulonu)</option>
                  <option value="Odim Gate">Odim Gate</option>
                  <option value="Main Gate">Main Gate (University Road)</option>
                </select>
              </div>

              {/* Maximum Rent Budget */}
              <div className="p-3 rounded-2xl bg-[#F9F8F6] border border-[#E8E5DF]/60 hover:border-[#C25E38]/40 transition-colors">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A5A58] mb-1">
                  Max Annual Budget
                </label>
                <select
                  value={maxRent === "" ? "" : String(maxRent)}
                  onChange={(e) =>
                    onMaxRentChange(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full bg-transparent font-medium text-sm text-[#121212] focus:outline-none cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  <option value="180000">Up to ₦180,000 / yr</option>
                  <option value="250000">Up to ₦250,000 / yr</option>
                  <option value="350000">Up to ₦350,000 / yr</option>
                  <option value="500000">Up to ₦500,000 / yr</option>
                </select>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="mt-3 pt-3 border-t border-[#E8E5DF]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#5A5A58]">
                <span className="w-2 h-2 rounded-full bg-[#1E513A]" />
                <span>Showing verified listings active for 2025/2026 session</span>
              </div>
              <button
                type="button"
                onClick={onSearchSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-sm font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <HiOutlineMagnifyingGlass className="w-4 h-4 text-white" />
                <span>Explore Matching Lodges</span>
              </button>
            </div>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left"
          >
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/60 border border-[#E8E5DF]/60">
              <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#C25E38] shrink-0">
                <RiShieldCheckLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#121212]">Deed & NIN Verified</h4>
                <p className="text-xs text-[#5A5A58] mt-0.5 leading-relaxed">
                  Every property deed and caretaker authority is manually vetted before publishing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/60 border border-[#E8E5DF]/60">
              <div className="p-2 rounded-xl bg-[#EBF3EE] text-[#1E513A] shrink-0">
                <RiWalkLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#121212]">Mapped Gate Proximity</h4>
                <p className="text-xs text-[#5A5A58] mt-0.5 leading-relaxed">
                  Real walking minutes to UNN Second Gate, Hilltop, and Odim Gates calculated by distance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/60 border border-[#E8E5DF]/60">
              <div className="p-2 rounded-xl bg-[#FAF2EE] text-[#C25E38] shrink-0">
                <RiDropLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#121212]">Borehole & Power Audited</h4>
                <p className="text-xs text-[#5A5A58] mt-0.5 leading-relaxed">
                  Running water consistency, generator schedule, and security fencing verified on-site.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
