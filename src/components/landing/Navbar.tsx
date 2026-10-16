"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiBars3, HiXMark, HiArrowUpRight, HiShieldCheck } from "react-icons/hi2";
import { RiBuildingLine } from "react-icons/ri";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E8E5DF] py-3.5 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#121212] flex items-center justify-center text-white transition-transform group-hover:scale-105 duration-200">
              <span className="font-serif text-xl font-bold tracking-tight text-[#FAF2EE]">Ụ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#121212] leading-none">
                Ụlọ<span className="text-[#C25E38]">.</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-[#5A5A58] mt-1">
                Curated campus living
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5A5A58]">
            <a
              href="#explore"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Explore Lodges
            </a>
            <a
              href="#gates"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Campus Gates
            </a>
            <a
              href="#standard"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              The Standard
            </a>
            <a
              href="#landlords"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              For Landlords
            </a>
          </nav>

          {/* Auth & CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#121212] hover:text-[#C25E38] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register?role=landlord"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C25E38] hover:bg-[#A84E2D] text-white text-sm font-medium transition-all shadow-xs hover:shadow-sm active:scale-[0.98]"
            >
              <RiBuildingLine className="w-4 h-4" />
              <span>List a Lodge</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-lg text-[#121212] hover:bg-[#E8E5DF] transition-colors"
            >
              {mobileMenuOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-Out */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-[#F9F8F6] border-b border-[#E8E5DF] px-4 pt-4 pb-6 space-y-4"
          >
            <nav className="flex flex-col space-y-3 text-base font-medium text-[#121212]">
              <a
                href="#explore"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                Explore Lodges
              </a>
              <a
                href="#gates"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                UNN Campus Gates
              </a>
              <a
                href="#standard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                The Ụlọ Standard
              </a>
              <a
                href="#landlords"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                For Landlords & Caretakers
              </a>
            </nav>
            <div className="pt-3 border-t border-[#E8E5DF] flex flex-col gap-2.5">
              <Link
                href="/auth/login"
                className="w-full text-center py-2.5 rounded-xl border border-[#E8E5DF] text-sm font-medium text-[#121212] hover:bg-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register?role=landlord"
                className="w-full text-center py-2.5 rounded-xl bg-[#C25E38] text-white text-sm font-medium hover:bg-[#A84E2D] transition-colors"
              >
                List a Lodge (Landlord)
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
