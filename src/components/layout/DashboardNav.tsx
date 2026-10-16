"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { RiBuildingLine, RiKey2Line } from "react-icons/ri";

export interface DashboardNavProps {
  role: "student" | "landlord" | "admin";
}

interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "landlord" | "admin";
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch (err) {
        // Handled silently
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      router.push("/auth/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const roleTitle =
    role === "landlord"
      ? "LANDLORD CONSOLE"
      : role === "admin"
      ? "ADMIN CONSOLE"
      : "STUDENT PORTAL";

  const landlordLinks = [
    { href: "/landlord/dashboard", label: "Occupancy Ledger" },
    { href: "/landlord/hostels/new", label: "List New Lodge" },
    { href: "/landlord/verification", label: "Verification Audit" },
    { href: "/#explore", label: "Public Directory" },
  ];

  const studentLinks = [
    { href: "/dashboard/bookings", label: "My 72h Holds" },
    { href: "/#explore", label: "Browse Lodges" },
    { href: "/#gates", label: "Campus Gates" },
    { href: "/#standard", label: "The Ụlọ Standard" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Moderation Queue" },
    { href: "/#explore", label: "Public Directory" },
    { href: "/dashboard/bookings", label: "Student Preview" },
    { href: "/landlord/dashboard", label: "Landlord Preview" },
  ];

  const links =
    role === "landlord" ? landlordLinks : role === "admin" ? adminLinks : studentLinks;

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#121212] flex items-center justify-center text-white transition-transform group-hover:scale-105 duration-200">
                <span className="font-serif text-lg font-bold tracking-tight text-[#FAF2EE]">Ụ</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#121212] leading-none">
                  Ụlọ<span className="text-[#C25E38]">.</span>
                </span>
                <span className="text-[9px] tracking-widest uppercase font-medium text-[#5A5A58] mt-0.5">
                  UNN Nsukka
                </span>
              </div>
            </Link>

            <span className="text-[#DCD8D0] hidden sm:inline select-none">|</span>

            {/* Portal Role Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E8E5DF] text-[10px] font-mono tracking-wider uppercase font-semibold text-[#121212]">
              {role === "landlord" && <HiShieldCheck className="w-3.5 h-3.5 text-[#1E513A]" />}
              {role === "admin" && <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5 text-[#C25E38]" />}
              {role === "student" && <HiOutlineAcademicCap className="w-3.5 h-3.5 text-[#121212]" />}
              <span>{roleTitle}</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#5A5A58]">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 relative transition-colors ${
                    isActive
                      ? "text-[#121212] font-semibold after:w-full after:h-[2px] after:bg-[#C25E38] after:absolute after:bottom-0 after:left-0"
                      : "hover:text-[#121212]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Identity & Sign Out */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-[#121212] leading-tight">
                {user?.fullName || (role === "landlord" ? "Verified Landlord" : role === "admin" ? "Platform Admin" : "UNN Student")}
              </span>
              <span className="text-[10px] font-mono text-[#5A5A58]">
                {user?.email || "Authenticated Session"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Sign out of account"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCD8D0] bg-white hover:bg-[#F3F0EB] text-[#121212] text-xs font-medium transition-colors cursor-pointer"
            >
              <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5 text-[#C25E38]" />
              <span>{loggingOut ? "Exiting..." : "Sign Out"}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Portal Navigation"
              className="p-2 rounded-lg text-[#121212] hover:bg-[#E8E5DF] transition-colors"
            >
              {mobileMenuOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F8F6] border-b border-[#E8E5DF] px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#121212]">
                {user?.fullName || "Active Session"}
              </span>
              <span className="text-[10.5px] font-mono text-[#5A5A58]">{roleTitle}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium"
            >
              <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#121212]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg transition-colors ${
                  pathname === link.href ? "bg-white font-semibold text-[#C25E38]" : "hover:bg-[#E8E5DF]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
