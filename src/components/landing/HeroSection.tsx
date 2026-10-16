"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiOutlineMagnifyingGlass, HiChevronDown } from "react-icons/hi2";
import { RiShieldCheckLine, RiWalkLine, RiDropLine } from "react-icons/ri";
import { CustomSelect, SelectOption } from "./CustomSelect";

interface HeroSectionProps {
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  selectedGate: string;
  onGateSelect: (gate: string) => void;
  maxRent: number | "";
  onMaxRentChange: (rent: number | "") => void;
  onSearchSubmit: () => void;
}

const ZONE_OPTIONS: SelectOption[] = [
  { label: "All Nsukka Zones", value: "" },
  { label: "Behind Flat (Second Gate)", value: "Behind Flat" },
  { label: "Hilltop (Engineering)", value: "Hilltop" },
  { label: "Odim Gate (Medical & Vet)", value: "Odim Gate" },
  { label: "Green House", value: "Green House" },
  { label: "Ofulonu", value: "Ofulonu" },
  { label: "Umunkaka", value: "Umunkaka" },
];

const GATE_OPTIONS: SelectOption[] = [
  { label: "Any Campus Gate", value: "" },
  { label: "Second Gate (Behind Flat)", value: "Second Gate" },
  { label: "Hilltop Gate (Engineering)", value: "Hilltop Gate" },
  { label: "Odim Gate", value: "Odim Gate" },
  { label: "Main Gate (University Road)", value: "Main Gate" },
];

const BUDGET_OPTIONS: SelectOption[] = [
  { label: "Any Budget", value: "" },
  { label: "Up to ₦180,000 / yr", value: 180000 },
  { label: "Up to ₦250,000 / yr", value: 250000 },
  { label: "Up to ₦350,000 / yr", value: 350000 },
  { label: "Up to ₦500,000 / yr", value: 500000 },
];

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
    <section className="relative pt-20 pb-6 sm:pt-28 sm:pb-12 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto w-full">
          {/* Pure Architectural Typography Overline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[10px] sm:text-xs font-mono tracking-[0.12em] sm:tracking-[0.22em] uppercase text-[#5A5A58] mb-3 sm:mb-4 select-none"
          >
            <span className="text-[#C25E38] font-bold">UNN Nsukka</span>
            <span className="mx-2 text-[#E8E5DF]">—</span>
            <span>Verified Student Lodges</span>
          </motion.p>

          {/* Main Headline with Clean Responsive Wrap */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="font-serif text-[1.85rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#121212] leading-[1.18] sm:leading-[1.16]"
          >
            Curated campus living,{" "}
            <span className="block sm:inline italic font-normal text-[#C25E38]">
              without the agent runaround.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-3 sm:mt-5 text-[13px] sm:text-base text-[#5A5A58] max-w-xl leading-relaxed"
          >
            Direct reservations in verified lodges across Behind Flat, Hilltop, and Odim Gate.
            Real walking times to UNN gates, 0% agent fees, and concurrency-safe room locking.
          </motion.p>

          {/* Desktop Single-Row Architectural Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="hidden sm:flex w-full mt-8 sm:mt-10 p-2.5 rounded-2xl bg-white border-2 border-[#121212]/15 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] relative z-20 items-center gap-2"
          >
            <div className="flex-1 min-w-0">
              <CustomSelect
                label="Lodging Zone"
                value={selectedZone}
                options={ZONE_OPTIONS}
                onChange={onZoneSelect}
                placeholder="All Nsukka Zones"
                variant="inline"
              />
            </div>

            <div className="w-[1.5px] h-8 bg-[#E2DFD8] shrink-0" />

            <div className="flex-1 min-w-0">
              <CustomSelect
                label="Nearest UNN Gate"
                value={selectedGate}
                options={GATE_OPTIONS}
                onChange={onGateSelect}
                placeholder="Any Campus Gate"
                variant="inline"
              />
            </div>

            <div className="w-[1.5px] h-8 bg-[#E2DFD8] shrink-0" />

            <div className="flex-1 min-w-0">
              <CustomSelect
                label="Max Annual Budget"
                value={maxRent}
                options={BUDGET_OPTIONS}
                onChange={onMaxRentChange}
                placeholder="Any Budget"
                variant="inline"
                align="right"
              />
            </div>

            <button
              type="button"
              onClick={onSearchSubmit}
              className="h-11 px-6 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-xs active:scale-[0.99] border border-[#121212]"
            >
              <HiOutlineMagnifyingGlass className="w-4 h-4 text-white" />
              <span className="font-bold">Explore Lodges</span>
            </button>
          </motion.div>

          {/* Mobile Defined 2-Row Architectural Console */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="flex sm:hidden flex-col w-full mt-5 p-2.5 rounded-2xl bg-white border-2 border-[#121212]/15 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] relative z-20 gap-2"
          >
            <div className="grid grid-cols-2 gap-2 text-left">
              <CustomSelect
                label="Zone"
                value={selectedZone}
                options={ZONE_OPTIONS}
                onChange={onZoneSelect}
                placeholder="All Zones"
                variant="cell"
                align="left"
              />
              <CustomSelect
                label="Nearest Gate"
                value={selectedGate}
                options={GATE_OPTIONS}
                onChange={onGateSelect}
                placeholder="Any Gate"
                variant="cell"
                align="right"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-left">
              <CustomSelect
                label="Max Budget"
                value={maxRent}
                options={BUDGET_OPTIONS}
                onChange={onMaxRentChange}
                placeholder="Any Budget"
                variant="cell"
              />
              <button
                type="button"
                onClick={onSearchSubmit}
                className="h-[46px] px-5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-xs active:scale-[0.98] border border-[#121212]"
              >
                <HiOutlineMagnifyingGlass className="w-4 h-4 text-white" />
                <span className="font-bold">Search</span>
              </button>
            </div>
          </motion.div>

          {/* Architectural 3-Column Trust Micro-Ledger */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-4 sm:mt-7 w-full max-w-lg mx-auto grid grid-cols-3 divide-x divide-[#E8E5DF] py-1 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 px-1.5 sm:px-2">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-[#C25E38] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#121212] font-semibold whitespace-nowrap">
                Deed & NIN
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-1.5 sm:px-2">
              <RiWalkLine className="w-3.5 h-3.5 text-[#1E513A] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#121212] font-semibold whitespace-nowrap">
                Gate Times
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-1.5 sm:px-2">
              <RiDropLine className="w-3.5 h-3.5 text-[#C25E38] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#121212] font-semibold whitespace-nowrap">
                Water Audited
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
