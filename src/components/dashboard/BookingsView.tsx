"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiPhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiArrowRight,
  HiOutlineLockClosed,
  HiOutlineCalendar,
} from "react-icons/hi2";

export interface BookingRecord {
  id: string;
  hostelId: string;
  hostelTitle: string;
  hostelImage?: string;
  zone: string;
  roomType: string;
  annualRent: number | string;
  academicSession: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  landlordName?: string;
  landlordPhone?: string;
  exactAddress?: string;
}

export function BookingsView() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "history">("pending");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/bookings");
        if (res.status === 401) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setBookings(json.data);
          }
        }
      } catch (err) {
        console.warn("[BookingsView] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to release this 72-hour room hold?")) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/v1/bookings/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "approved") return b.status === "approved";
    return ["rejected", "cancelled", "expired"].includes(b.status);
  });

  return (
    <div className="w-full text-[#121212] pt-8 sm:pt-10 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Overline */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#5A5A58] hover:text-[#121212] transition-colors mb-2"
          >
            &larr; Back to Public Directory
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
            My Room Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans">
            Track your 72-hour student room holds, review landlord approval decisions, and inspect physical lodge addresses.
          </p>
        </div>

        {/* Unauthorized State */}
        {unauthorized ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E8E5DF] text-center max-w-lg mx-auto shadow-xs space-y-4 my-8">
            <div className="w-12 h-12 rounded-xl bg-[#FAF2EE] text-[#C25E38] flex items-center justify-center mx-auto">
              <HiOutlineLockClosed className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#121212]">
              Authentication Required
            </h3>
            <p className="text-xs text-[#5A5A58] leading-relaxed">
              Sign in with your verified UNN student account to access your live reservation holds, review landlord approval status, and retrieve direct contact numbers.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login?redirect=/dashboard/bookings"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Sign in to Student Portal</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tabbed Status Navigation */}
            <div className="flex items-center justify-between border-b border-[#E8E5DF] mb-6">
              <div className="flex items-center gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "pending"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Active Holds (72h)
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-xs bg-[#F4F3F0] text-[10px] font-mono">
                    {bookings.filter((b) => b.status === "pending").length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "approved"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Approved Holds
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-xs bg-[#EBF3EE] text-[#1E513A] text-[10px] font-mono font-semibold">
                    {bookings.filter((b) => b.status === "approved").length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "history"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Past / Released
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-xs bg-[#F4F3F0] text-[10px] font-mono">
                    {bookings.filter((b) => !["pending", "approved"].includes(b.status)).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                  Loading your UNN room reservations...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              /* Genuine Empty State */
              <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF] space-y-3">
                <HiOutlineBuildingOffice2 className="w-10 h-10 text-[#C25E38] mx-auto opacity-70" />
                <h3 className="font-serif text-lg font-bold text-[#121212]">
                  {activeTab === "pending"
                    ? "No active 72-hour room holds"
                    : activeTab === "approved"
                    ? "No approved holds yet"
                    : "No past reservation records"}
                </h3>
                <p className="text-xs text-[#5A5A58] max-w-sm mx-auto">
                  {activeTab === "pending"
                    ? "When you place a 72-hour hold on a verified student lodge, your room is locked and the landlord is alerted for physical inspection."
                    : "Once a landlord approves your inspection request, their direct contact details and exact compound address will unlock here."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/#explore"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors"
                  >
                    <span>Browse Verified Lodges</span>
                    <HiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Live Dynamic Bookings List */
              <div className="space-y-4">
                {filtered.map((booking) => {
                  const expiresDate = new Date(booking.expiresAt);
                  const hoursLeft = Math.max(
                    0,
                    Math.round((expiresDate.getTime() - Date.now()) / (1000 * 3600))
                  );

                  return (
                    <div
                      key={booking.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                    >
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#121212] bg-[#F4F3F0] px-2 py-0.5 rounded-xs font-semibold">
                            REF: {booking.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-xs font-semibold ${
                              booking.status === "approved"
                                ? "bg-[#EBF3EE] text-[#1E513A]"
                                : booking.status === "pending"
                                ? "bg-[#FAF2EE] text-[#C25E38]"
                                : "bg-[#F4F3F0] text-[#5A5A58]"
                            }`}
                          >
                            {booking.status === "approved"
                              ? "HOLD APPROVED"
                              : booking.status === "pending"
                              ? `${hoursLeft}H REMAINING (72H HOLD)`
                              : booking.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#5A5A58]">•</span>
                          <span className="text-xs font-sans text-[#5A5A58]">
                            Session {booking.academicSession}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#121212]">
                          {booking.hostelTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5A5A58]">
                          <span className="font-medium text-[#121212]">{booking.roomType}</span>
                          <span>•</span>
                          <span>Zone: {booking.zone}</span>
                          <span>•</span>
                          <span className="font-mono text-[#C25E38] font-bold">
                            ₦{Number(booking.annualRent).toLocaleString()} / year
                          </span>
                        </div>

                        {/* Unlocked Landlord Contact for Approved Bookings */}
                        {booking.status === "approved" && (
                          <div className="mt-3 p-3.5 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1] space-y-2 text-xs">
                            <div className="font-mono text-[10.5px] uppercase tracking-wider font-bold text-[#1E513A] flex items-center gap-1.5">
                              <HiCheckCircle className="w-4 h-4 text-[#1E513A]" />
                              <span>Unlocked Compound Contact & Coordinates</span>
                            </div>
                            {booking.landlordName && (
                              <p className="text-[#121212]">
                                Landlord / Caretaker: <span className="font-semibold">{booking.landlordName}</span>
                              </p>
                            )}
                            {booking.exactAddress && (
                              <p className="text-[#5A5A58]">
                                Exact Address: <span className="text-[#121212] font-mono">{booking.exactAddress}</span>
                              </p>
                            )}
                            {booking.landlordPhone && (
                              <div className="flex items-center gap-2 pt-1">
                                <a
                                  href={`tel:${booking.landlordPhone}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DCD8D0] bg-white text-xs font-medium text-[#121212] hover:bg-[#F3F0EB]"
                                >
                                  <HiPhone className="w-3.5 h-3.5 text-[#C25E38]" />
                                  <span>{booking.landlordPhone}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-medium transition-colors"
                          >
                            {cancellingId === booking.id ? "Releasing..." : "Release Hold"}
                          </button>
                        )}
                        <Link
                          href={`/hostels/${booking.hostelId}`}
                          className="px-3.5 py-2 rounded-xl border border-[#DCD8D0] bg-[#F8F7F4] hover:bg-white text-xs font-medium text-[#121212] transition-colors"
                        >
                          View Lodge
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
