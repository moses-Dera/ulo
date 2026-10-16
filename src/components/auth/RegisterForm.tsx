"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HiArrowRight, HiOutlineUser, HiOutlineBuildingOffice2 } from "react-icons/hi2";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "landlord" ? "landlord" : "student";

  const [role, setRole] = useState<"student" | "landlord">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint =
      role === "student"
        ? "/api/v1/auth/register/student"
        : "/api/v1/auth/register/landlord";

    const payload =
      role === "student"
        ? { fullName, email, phone, password, regNumber, department }
        : { fullName, email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Registration failed. Please check your details.");
      }

      if (role === "landlord") {
        router.push("/landlord/dashboard");
      } else {
        router.push("/dashboard/bookings");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xl shadow-black/[0.03]">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#121212]">
          Join the Ụlọ Network
        </h1>
        <p className="text-xs text-[#5A5A58] mt-1.5 font-sans">
          Select your account type to get started.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF] mb-6">
        <button
          type="button"
          onClick={() => {
            setRole("student");
            setError(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            role === "student"
              ? "bg-white text-[#121212] font-bold shadow-xs border border-[#121212]/15"
              : "text-[#5A5A58] hover:text-[#121212]"
          }`}
        >
          <HiOutlineUser className="w-4 h-4" />
          <span>UNN Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("landlord");
            setError(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            role === "landlord"
              ? "bg-white text-[#121212] font-bold shadow-xs border border-[#121212]/15"
              : "text-[#5A5A58] hover:text-[#121212]"
          }`}
        >
          <HiOutlineBuildingOffice2 className="w-4 h-4" />
          <span>Property Owner</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
            {role === "student" ? "Full Name (as registered with UNN)" : "Landlord / Caretaker Full Name"}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Chukwuemeka Okafor"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "student" ? "student@unn.edu.ng" : "landlord@gmail.com"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08034567890"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {role === "student" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                UNN Reg Number
              </label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="2021/245892"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                Department / Faculty
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Electronic Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
            Create Password (Min 8 characters with 1 number & 1 capital)
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          <span>{submitting ? "Creating Account..." : `Register as ${role === "student" ? "UNN Student" : "Property Owner"}`}</span>
          <HiArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-[#E8E5DF] text-center text-xs text-[#5A5A58]">
        <span>Already have an account? </span>
        <Link href="/auth/login" className="text-[#C25E38] font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
