"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiShieldExclamation,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

interface LodgeOption {
  id: string;
  title: string;
  zone: string;
}

export function ReportForm() {
  const [lodges, setLodges] = useState<LodgeOption[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [reason, setReason] = useState("Extortion / Illegal Agent Fee Demanded");
  const [note, setNote] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successCase, setSuccessCase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLodges() {
      try {
        const res = await fetch("/api/v1/hostels?limit=50");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.results) {
            setLodges(
              json.data.results.map((h: any) => ({
                id: h.id,
                title: h.title,
                zone: h.zone,
              }))
            );
            if (json.data.results.length > 0) {
              setSelectedHostelId(json.data.results[0].id);
            }
          }
        }
      } catch (err) {
        // Fallback silently
      }
    }
    fetchLodges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostelId) {
      setError("Please select the student lodge you wish to report.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostelId: selectedHostelId,
          reason,
          note: studentContact ? `${note} (Student Contact: ${studentContact})` : note,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to file incident report. Please try again.");
      }

      setSuccessCase(json.data?.reportId || `ULO-REP-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while transmitting report.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successCase) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs text-center max-w-xl mx-auto space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF3EE] text-[#1E513A] flex items-center justify-center mx-auto">
          <HiOutlineCheckCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#121212]">
            Incident Report Filed
          </h2>
          <p className="text-xs font-mono text-[#5A5A58] mt-2">
            Case Reference: <span className="font-bold text-[#121212]">{successCase}</span>
          </p>
        </div>

        <p className="text-sm text-[#5A5A58] leading-relaxed font-sans">
          Your report has been forwarded to the Ụlọ Platform Moderation Desk and the UNN Campus Housing Integrity Taskforce. If urgent, our team will contact you via your provided contact details.
        </p>

        <div className="p-4 rounded-xl bg-[#FAF2EE] border border-[#F0D5C9] text-left text-xs text-[#121212] space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[#C25E38] block tracking-wider">
            Zero Tolerance Protocol
          </span>
          <p className="text-[#5A5A58]">
            Landlords verified on Ụlọ who demand unofficial agency fees or deliberately misrepresent compound utilities face immediate listing suspension and deed de-registration.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all text-center"
          >
            Return to Directory
          </Link>
          <Link
            href="/dashboard/bookings"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#DCD8D0] bg-white hover:bg-[#F3F0EB] text-[#121212] text-xs font-medium transition-all text-center"
          >
            Check My Reservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#5A5A58] hover:text-[#121212] transition-colors mb-3"
        >
          <HiOutlineArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Directory</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
          Report a Problematic Lodge
        </h1>
        <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans max-w-2xl">
          Help maintain safe, extortion-free campus living in Nsukka. Report illegal agent commissions, false utility promises, or compound safety threats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1.5 font-semibold">
                Target Student Lodge *
              </label>
              {lodges.length > 0 ? (
                <select
                  value={selectedHostelId}
                  onChange={(e) => setSelectedHostelId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
                >
                  {lodges.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.zone})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude's Lodge, Behind Flat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
                />
              )}
            </div>

            <div>
              <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1.5 font-semibold">
                Violation Category *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
              >
                <option value="Extortion / Illegal Agent Fee Demanded">
                  Extortion / Illegal Agent or Agreement Fee Demanded
                </option>
                <option value="Misrepresented Proximity / Gate Distance">
                  Misrepresented Walking Minutes or Campus Gate Proximity
                </option>
                <option value="Water or Power Infrastructure Total Failure">
                  Water Borehole or Power Infrastructure Unusable / Total Failure
                </option>
                <option value="Security & Physical Safety Risk">
                  Severe Compound Security Breach or Physical Safety Hazard
                </option>
                <option value="Unauthorized 72h Hold Cancellation">
                  Landlord Refused to Honor Active 72-Hour Free Reservation Hold
                </option>
                <option value="Impersonation / Fake Landlord">
                  Suspected Middleman Impersonating Actual Property Owner
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1.5 font-semibold">
                Detailed Incident Description *
              </label>
              <textarea
                required
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="State what occurred, amounts demanded if any, dates, and names of individuals involved..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1.5 font-semibold">
                Your Contact (UNN Student Email or Phone Number)
              </label>
              <input
                type="text"
                value={studentContact}
                onChange={(e) => setStudentContact(e.target.value)}
                placeholder="e.g. chinedu.okeke@unn.edu.ng or 08031234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] transition-colors"
              />
              <span className="text-[10px] text-[#5A5A58] mt-1 block">
                Your identity is kept strictly confidential from the landlord.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#C25E38] hover:bg-[#A84E2D] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Transmitting Incident..." : "Submit Confidential Report"}
            </button>
          </form>
        </div>

        {/* Sidebar Assistance */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#C25E38]">
              <HiShieldExclamation className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-[#121212]">
                Campus Safety Protocol
              </h3>
            </div>
            <p className="text-xs text-[#5A5A58] leading-relaxed font-sans">
              Every property listed on Ụlọ commits to the UNN Zero-Commission charter. You are never required to pay inspection fees, “customary gate allowances”, or middleman cuts.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF2EE] border border-[#F0D5C9] space-y-1 text-xs">
              <span className="font-mono text-[10px] uppercase font-bold text-[#C25E38] block tracking-wider">
                Emergency Dispatch Line
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#121212]">
                <HiOutlinePhone className="w-3.5 h-3.5 text-[#C25E38]" />
                <span>0800-856-4357</span>
              </div>
              <p className="text-[10.5px] text-[#5A5A58]">
                Toll-free 24/7 for active student dispute intervention.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#121212]">
              What Happens Next?
            </h4>
            <ol className="text-xs text-[#5A5A58] space-y-2 list-decimal pl-4 leading-relaxed">
              <li>Platform moderators freeze pending reservations for the reported lodge.</li>
              <li>The landlord receives a formal request for explanation within 24 hours.</li>
              <li>Confirmed violations result in permanent de-listing and notification to the UNN Student Affairs Division.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
