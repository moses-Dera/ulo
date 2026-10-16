"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiBuildingLine, RiShieldCheckLine } from "react-icons/ri";
import { HiArrowUpRight, HiShieldCheck } from "react-icons/hi2";

export function LandlordBanner() {
  return (
    <section id="landlords" className="py-20 md:py-28 bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <p className="text-[11px] sm:text-xs font-mono tracking-[0.22em] uppercase text-[#C25E38] mb-4 font-semibold select-none">
              Direct Landlord Network — UNN Nsukka
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Fill your vacant student units with zero commission fees.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#E8E5DF]/80 max-w-2xl leading-relaxed">
              Stop relying on middlemen who charge illegal upfront agency fees. Get direct booking requests from verified UNN students and track real-time occupancy on your dedicated landlord dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <HiShieldCheck className="w-5 h-5 text-[#C25E38]" />
                <span>NIN & Deed Verification Badge</span>
              </div>
              <div className="flex items-center gap-2">
                <RiShieldCheckLine className="w-5 h-5 text-[#C25E38]" />
                <span>0% Agency Commission Deductions</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
            <Link
              href="/auth/register?role=landlord"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#C25E38] hover:bg-[#A84E2D] text-white font-medium text-sm transition-all shadow-md active:scale-[0.99] text-center"
            >
              <span>Verify & List Your Lodge</span>
              <HiArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors text-center border border-white/10"
            >
              <span>Landlord Portal Login</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
