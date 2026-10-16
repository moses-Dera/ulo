"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiShieldCheck, HiArrowRight } from "react-icons/hi2";
import { RiWalkLine, RiDropLine, RiFlashlightLine, RiShieldCheckLine } from "react-icons/ri";

export interface LodgeItem {
  id: string;
  name: string;
  zone: string;
  gateProximity: string;
  walkingMinutes: number;
  minRent: number;
  roomType: string;
  availableUnits: number;
  totalUnits: number;
  imageUrl: string;
  isVerifiedLandlord: boolean;
  amenities: string[];
}

interface LodgeCardProps {
  lodge: LodgeItem;
}

export function LodgeCard({ lodge }: LodgeCardProps) {
  const formattedRent = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(lodge.minRent);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-white rounded-3xl border border-[#E8E5DF] overflow-hidden hover:shadow-lg hover:shadow-black/[0.04] hover:border-[#121212]/30 transition-all duration-300"
    >
      {/* 16:9 Image Preview Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F9F8F6]">
        <Image
          src={lodge.imageUrl}
          alt={lodge.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {lodge.isVerifiedLandlord ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E513A] text-white text-[11px] font-semibold tracking-wide shadow-sm">
              <HiShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Verified Landlord</span>
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#121212] text-[11px] font-semibold tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1E513A] animate-pulse" />
            <span>{lodge.availableUnits} Available</span>
          </span>
        </div>

        {/* Bottom Walking Distance Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212]/80 backdrop-blur-md text-[#FAF2EE] text-xs font-medium">
            <RiWalkLine className="w-3.5 h-3.5 text-[#C25E38]" />
            <span>{lodge.walkingMinutes} min walk to {lodge.gateProximity}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Zone & Room Type Header */}
          <div className="flex items-center justify-between text-xs text-[#5A5A58] mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[#C25E38]">
              {lodge.zone}
            </span>
            <span className="bg-[#FAF2EE] px-2 py-0.5 rounded-md text-[#C25E38] font-medium">
              {lodge.roomType}
            </span>
          </div>

          {/* Lodge Name */}
          <h3 className="font-serif text-xl font-bold text-[#121212] tracking-tight group-hover:text-[#C25E38] transition-colors line-clamp-1">
            {lodge.name}
          </h3>

          {/* Key Amenities */}
          <div className="mt-3.5 flex flex-wrap gap-2 text-xs text-[#5A5A58]">
            <span className="inline-flex items-center gap-1 bg-[#F9F8F6] px-2.5 py-1 rounded-lg border border-[#E8E5DF]/60">
              <RiDropLine className="w-3.5 h-3.5 text-[#1E513A]" />
              <span>Borehole Water</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-[#F9F8F6] px-2.5 py-1 rounded-lg border border-[#E8E5DF]/60">
              <RiFlashlightLine className="w-3.5 h-3.5 text-[#C25E38]" />
              <span>Standby Power</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-[#F9F8F6] px-2.5 py-1 rounded-lg border border-[#E8E5DF]/60">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-[#121212]" />
              <span>Fenced</span>
            </span>
          </div>
        </div>

        {/* Pricing & CTA Action Footer */}
        <div className="mt-5 pt-4 border-t border-[#E8E5DF] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#5A5A58] uppercase tracking-wider">
              Annual Rent
            </div>
            <div className="text-lg font-bold text-[#121212] tracking-tight">
              {formattedRent}
              <span className="text-xs font-normal text-[#5A5A58] ml-1">/ session</span>
            </div>
          </div>

          <Link
            href={`/hostels/${lodge.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#C25E38] text-white text-xs font-medium transition-all group-hover:translate-x-0.5"
          >
            <span>View Lodge</span>
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
