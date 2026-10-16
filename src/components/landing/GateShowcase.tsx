"use client";

import React from "react";
import { motion } from "framer-motion";
import { RiWalkLine, RiMapPin2Line } from "react-icons/ri";
import { HiOutlineClock, HiOutlineMapPin } from "react-icons/hi2";

const GATES = [
  {
    name: "Second Gate",
    zone: "Behind Flat",
    walkingTime: "2 – 5 mins",
    faculties: "Social Sciences, Arts, Carver, CEC",
    description: "The most popular gate for Humanities and Social Science students. Gentle, flat paved walk directly into campus.",
    badgeColor: "bg-[#FAF2EE] text-[#C25E38]",
  },
  {
    name: "Hilltop Gate",
    zone: "Hilltop & Ofulonu",
    walkingTime: "3 – 7 mins",
    faculties: "Engineering, Physical Sciences, Jibril Aminu",
    description: "Ideal for Tech and Engineering students. Close proximity to departmental workshops and lecture theaters.",
    badgeColor: "bg-[#EBF3EE] text-[#1E513A]",
  },
  {
    name: "Odim Gate",
    zone: "Odim & Green House",
    walkingTime: "4 – 8 mins",
    faculties: "Medical Sciences, Veterinary Medicine, PG School",
    description: "Quiet residential cluster preferred by medical, pre-clinical, and postgraduate students seeking study peace.",
    badgeColor: "bg-[#FAF2EE] text-[#C25E38]",
  },
  {
    name: "Main Gate",
    zone: "Town / University Road",
    walkingTime: "8 – 14 mins",
    faculties: "Admin Complex, Bank Cluster, Franco Building",
    description: "Direct shuttle access to Nsukka town, commercial markets, and university administrative offices.",
    badgeColor: "bg-[#F9F8F6] text-[#121212]",
  },
];

export function GateShowcase() {
  return (
    <section id="gates" className="py-20 md:py-28 bg-white border-t border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.22em] uppercase text-[#C25E38] font-semibold mb-2.5 select-none">
            Campus Geography — Walking Times
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#121212] tracking-tight">
            Map Your Walk to 8:00 AM Lectures
          </h2>
          <p className="mt-3 text-base text-[#5A5A58] leading-relaxed">
            Off-campus living shouldn&apos;t mean spending ₦500 daily on bike shuttles. Every lodge on Ụlọ is indexed by its walking distance to UNN&apos;s 4 primary campus gates.
          </p>
        </div>

        {/* Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GATES.map((gate, index) => (
            <motion.div
              key={gate.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 rounded-3xl bg-[#F9F8F6] border border-[#E8E5DF] hover:border-[#121212]/30 hover:shadow-md hover:shadow-black/[0.02] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Walking Time Architectural Header */}
                <div className="flex items-center justify-between mb-4 border-b border-[#E8E5DF] pb-3">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#C25E38]">
                    <RiWalkLine className="w-3.5 h-3.5 text-[#C25E38]" />
                    <span>{gate.walkingTime}</span>
                  </div>
                  <span className="font-mono text-[9.5px] tracking-wider uppercase text-[#5A5A58]">
                    ZONE // {gate.zone}
                  </span>
                </div>

                {/* Gate Name */}
                <h3 className="font-serif text-2xl font-bold text-[#121212] tracking-tight">
                  {gate.name}
                </h3>

                {/* Description */}
                <p className="mt-3 text-xs text-[#5A5A58] leading-relaxed">
                  {gate.description}
                </p>
              </div>

              {/* Faculty Proximity Footer */}
              <div className="mt-6 pt-4 border-t border-[#E8E5DF]/70">
                <span className="block text-[10px] uppercase font-semibold text-[#5A5A58] tracking-wider mb-1">
                  Immediate Access To
                </span>
                <span className="text-xs font-medium text-[#121212] line-clamp-2">
                  {gate.faculties}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
