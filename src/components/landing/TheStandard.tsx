"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiShieldCheck, HiCheckBadge, HiOutlineSparkles } from "react-icons/hi2";
import { RiShieldCheckLine, RiDropLine, RiWalkLine } from "react-icons/ri";

const STEPS = [
  {
    number: "01",
    title: "Filter by Real Campus Distance",
    description:
      "Explore student accommodations with authentic walking minutes to UNN Second Gate, Hilltop, or Odim Gate. No misleading estimates or surprise treks.",
    icon: RiWalkLine,
    accent: "bg-[#FAF2EE] text-[#C25E38]",
  },
  {
    number: "02",
    title: "Submit a Free Reservation Request",
    description:
      "Lock in your room with your verified UNN student credentials without paying a single kobo in agent commission or search fees. Your request is held for 72 hours.",
    icon: RiShieldCheckLine,
    accent: "bg-[#EBF3EE] text-[#1E513A]",
  },
  {
    number: "03",
    title: "Direct Landlord Connection",
    description:
      "As soon as the landlord approves your booking, their direct phone line and exact compound directions unlock on your student dashboard. Move in with confidence.",
    icon: HiCheckBadge,
    accent: "bg-[#FAF2EE] text-[#C25E38]",
  },
];

export function TheStandard() {
  return (
    <section id="standard" className="py-20 md:py-28 bg-[#F9F8F6] border-t border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.22em] uppercase text-[#C25E38] font-semibold mb-2.5 select-none">
            The Ụlọ Standard — Fair Student Living
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#121212] tracking-tight">
            The Ụlọ Standard
          </h2>
          <p className="mt-3 text-base text-[#5A5A58] leading-relaxed">
            Built to dismantle the exploitative off-campus housing hustle in Nsukka through transparency, verified ownership, and zero middlemen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-[#E8E5DF] tracking-wider">
                      {step.number}
                    </span>
                    <div className={`p-3 rounded-2xl ${step.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#121212] tracking-tight">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#5A5A58] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8E5DF]/60 flex items-center gap-2 text-xs font-medium text-[#1E513A]">
                  <HiShieldCheck className="w-4 h-4 text-[#1E513A]" />
                  <span>Guaranteed by Ụlọ Policy</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
