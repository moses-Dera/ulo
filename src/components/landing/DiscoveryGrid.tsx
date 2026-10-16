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
    <section id="explore" className="py-16 md:py-24 border-t border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C25E38] mb-2">
              Curated Accommodations
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#121212] tracking-tight">
              Explore Verified UNN Lodges
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5A5A58]">
            <span className="font-medium text-[#121212]">{filteredLodges.length}</span>
            <span>lodges currently accepting reservations</span>
          </div>
        </div>

        {/* Gliding Active Pill Zone Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {ZONES.map((zone) => {
            const isActive = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => onZoneSelect(zone.id)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? "text-white" : "text-[#5A5A58] hover:text-[#121212] bg-white border border-[#E8E5DF]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeZonePill"
                    className="absolute inset-0 bg-[#121212] rounded-full -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>{zone.label}</span>
              </button>
            );
          })}
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
