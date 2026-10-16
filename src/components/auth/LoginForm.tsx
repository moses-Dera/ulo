"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineLockClosed, HiOutlineEnvelope, HiArrowRight } from "react-icons/hi2";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid email or password. Please verify.");
      }

      const role = data.data?.user?.role;
      if (role === "landlord") {
        router.push("/landlord/dashboard");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard/bookings");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xl shadow-black/[0.03]">
      {/* Form Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#121212]">
          Sign in to Ụlọ
        </h1>
        <p className="text-xs text-[#5A5A58] mt-1.5 font-sans">
          Manage your room reservations or landlord vacancy listings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
            Email Address
          </label>
          <div className="relative">
            <HiOutlineEnvelope className="w-4 h-4 text-[#5A5A58] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@unn.edu.ng or personal email"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] font-semibold">
              Password
            </label>
            <span className="text-[10px] font-mono text-[#C25E38] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <HiOutlineLockClosed className="w-4 h-4 text-[#5A5A58] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          <span>{submitting ? "Authenticating..." : "Sign In to Account"}</span>
          <HiArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 pt-5 border-t border-[#E8E5DF] text-center text-xs text-[#5A5A58]">
        <span>New to Ụlọ? </span>
        <Link
          href="/auth/register"
          className="text-[#C25E38] font-semibold hover:underline"
        >
          Create free student or landlord account
        </Link>
      </div>
    </div>
  );
}
