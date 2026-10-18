"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { RiBuildingLine } from "react-icons/ri";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; fullName: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Handled silently
      }
    }
    checkAuth();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E8E5DF] py-2.5 sm:py-3 shadow-xs"
          : "bg-transparent py-3 sm:py-3.5"
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
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5A5A58]">
            <a
              href="/#explore"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Explore Lodges
            </a>
            <a
              href="/#gates"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Campus Gates
            </a>
            <a
              href="/#standard"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              The Standard
            </a>
            <Link
              href="/dashboard/bookings"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              My Bookings
            </Link>
            <Link
              href="/landlord/dashboard"
              className="hover:text-[#121212] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Landlord Console
            </Link>
          </nav>

          {/* Auth & CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#121212] hover:text-[#C25E38] hover:bg-white/60 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-[#FAF2EE] text-[#C25E38] font-bold text-xs flex items-center justify-center border border-[#E8E5DF]">
                    {user.fullName ? user.fullName[0].toUpperCase() : "Ụ"}
                  </div>
                  <span>My Profile</span>
                </Link>
                <Link
                  href={
                    user.role === "landlord"
                      ? "/landlord/dashboard"
                      : user.role === "admin"
                      ? "/admin"
                      : "/dashboard/bookings"
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-sm font-medium transition-all shadow-xs hover:shadow-sm active:scale-[0.98]"
                >
                  <RiBuildingLine className="w-4 h-4 text-[#C25E38]" />
                  <span>
                    {user.role === "landlord"
                      ? "Landlord Console"
                      : user.role === "admin"
                      ? "Admin Console"
                      : "My 72h Holds"}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#121212] hover:text-[#C25E38] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/landlord/hostels/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C25E38] hover:bg-[#A84E2D] text-white text-sm font-medium transition-all shadow-xs hover:shadow-sm active:scale-[0.98]"
                >
                  <RiBuildingLine className="w-4 h-4" />
                  <span>List a Lodge</span>
                </Link>
              </>
            )}
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
            <nav className="flex flex-col space-y-2 text-base font-medium text-[#121212]">
              <a
                href="/#explore"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                Explore Lodges
              </a>
              <a
                href="/#gates"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                UNN Campus Gates
              </a>
              <a
                href="/#standard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors"
              >
                The Ụlọ Standard
              </a>
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#FAF2EE] text-[#C25E38] hover:bg-[#F3E5DE] transition-colors font-semibold flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-md bg-[#C25E38] text-white text-[11px] font-bold flex items-center justify-center">
                    {user.fullName ? user.fullName[0].toUpperCase() : "Ụ"}
                  </div>
                  <span>My Profile ({user.fullName})</span>
                </Link>
              )}
              <Link
                href="/dashboard/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors font-semibold"
              >
                My Bookings (Student Holds)
              </Link>
              <Link
                href="/landlord/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors font-semibold"
              >
                Landlord Console
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-[#E8E5DF] transition-colors text-xs font-mono uppercase tracking-wider text-[#5A5A58]"
              >
                Admin Console
              </Link>
            </nav>
            <div className="pt-3 border-t border-[#E8E5DF] flex flex-col gap-2.5">
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#121212] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  Manage Account & Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-[#E8E5DF] text-sm font-medium text-[#121212] hover:bg-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/landlord/hostels/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-[#C25E38] text-white text-sm font-medium hover:bg-[#A84E2D] transition-colors"
                  >
                    List a Lodge (Landlord)
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
