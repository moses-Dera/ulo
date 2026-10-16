"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LodgeCard, LodgeItem } from "./LodgeCard";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

interface DiscoveryGridProps {
  initialLodges: LodgeItem[];
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
}

const ZONES = [
  { id: "", label: "All Lodges" },
  { id: "Behind Flat", label: "Behind Flat" },
  { id: "Hilltop", label: "Hilltop" },
  { id: "Odim Gate", label: "Odim Gate" },
  { id: "Green House", label: "Green House" },
  { id: "Ofulonu", label: "Ofulonu" },
];

export function DiscoveryGrid({
  initialLodges,
  selectedZone,
  onZoneSelect,
}: DiscoveryGridProps) {
  const filteredLodges = selectedZone
    ? initialLodges.filter((lodge) =>
        lodge.zone.toLowerCase().includes(selectedZone.toLowerCase())
      )
    : initialLodges;

  return (
    <section id="explore" className="pt-2 sm:pt-4 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimalist Zone Directory Ledger Tabs */}
        <div className="flex items-center justify-between border-b border-[#E8E5DF] mb-6 sm:mb-8 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-5 sm:gap-8">
          {ZONES.map((zone, idx) => {
            const isActive = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => onZoneSelect(zone.id)}
                className={`relative pb-3 pt-1 flex items-center gap-1.5 text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  isActive ? "text-[#121212] font-bold" : "text-[#5A5A58] hover:text-[#121212]"
                }`}
              >
                <span>{zone.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeZoneLedger"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25E38]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
          </div>

          <div className="hidden sm:block text-xs font-mono text-[#5A5A58] whitespace-nowrap pl-4 pb-2">
            <span className="font-bold text-[#121212]">{filteredLodges.length}</span> properties
          </div>
        </div>

        {/* Lodges Grid */}
        <AnimatePresence mode="popLayout">
          {filteredLodges.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredLodges.map((lodge) => (
                <LodgeCard key={lodge.id} lodge={lodge} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 px-4 rounded-3xl bg-white border border-[#E8E5DF]"
            >
              <div className="inline-flex p-3 rounded-2xl bg-[#FAF2EE] text-[#C25E38] mb-4">
                <HiOutlineAdjustmentsHorizontal className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#121212]">
                No lodges found in {selectedZone}
              </h3>
              <p className="text-sm text-[#5A5A58] max-w-sm mx-auto mt-2">
                We are actively verifying more properties in this zone. Try selecting &quot;All Lodges&quot; to see available rooms.
              </p>
              <button
                onClick={() => onZoneSelect("")}
                className="mt-5 px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
