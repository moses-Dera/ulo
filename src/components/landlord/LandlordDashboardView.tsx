"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineAcademicCap,
  HiArrowRight,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { RiBuildingLine, RiKey2Line } from "react-icons/ri";

export interface StudentBookingItem {
  id: string;
  bookingRef: string;
  hostelTitle: string;
  hostelZone: string;
  roomType: string;
  annualRent: number;
  studentName: string;
  studentRegNo: string;
  studentDepartment: string;
  studentLevel: string;
  studentPhone: string;
  studentEmail: string;
  academicSession: string;
  requestedAt: string;
  expiresAt: string;
  studentNote?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
}

interface OccupancySummary {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  pendingRequests: number;
}

interface ManagedLodge {
  id: string;
  title: string;
  zone: string;
  streetText: string;
  primaryImage: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  minRent: number;
}

export function LandlordDashboardView() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "lodges">("pending");
  const [bookings, setBookings] = useState<StudentBookingItem[]>([]);
  const [lodges, setLodges] = useState<ManagedLodge[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [summary, setSummary] = useState<OccupancySummary>({
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    pendingRequests: 0,
  });

  // Fetch live landlord data from PostgreSQL
  useEffect(() => {
    async function fetchLandlordData() {
      setLoading(true);
      try {
        const [occRes, bkgRes] = await Promise.all([
          fetch("/api/v1/landlord/occupancy"),
          fetch("/api/v1/landlord/bookings"),
        ]);

        if (occRes.status === 401 || bkgRes.status === 401) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        if (occRes.ok) {
          const occData = await occRes.json();
          if (occData.success && occData.data?.summary) {
            setSummary({
              totalUnits: occData.data.summary.totalUnits || 0,
              occupiedUnits: occData.data.summary.occupiedUnits || 0,
              vacantUnits: occData.data.summary.vacantUnits || 0,
              pendingRequests: occData.data.summary.pendingRequests || 0,
            });
            if (Array.isArray(occData.data.hostels)) {
              setLodges(
                occData.data.hostels.map((h: any) => ({
                  id: h.id,
                  title: h.title,
                  zone: h.zone,
                  streetText: h.streetText || "UNN Campus Zone",
                  primaryImage: h.primaryImage || "/images/lodges/palm-exterior.webp",
                  totalUnits: h.stats?.totalUnits || 0,
                  occupiedUnits: h.stats?.occupiedUnits || 0,
                  vacantUnits: h.stats?.vacantUnits || 0,
                  minRent: h.minRent || 0,
                }))
              );
            }
          }
        }

        if (bkgRes.ok) {
          const bkgData = await bkgRes.json();
          if (bkgData.success && Array.isArray(bkgData.data)) {
            const mapped: StudentBookingItem[] = bkgData.data.map((item: any) => ({
              id: item.booking.id,
              bookingRef: item.booking.id.slice(0, 8).toUpperCase(),
              hostelTitle: item.hostel.title,
              hostelZone: item.hostel.zone,
              roomType: item.roomType.label,
              annualRent: Number(item.roomType.annualRent),
              studentName: item.studentUser?.fullName || "UNN Student",
              studentRegNo: item.studentProfile?.unnRegNumber || "2022/UNN",
              studentDepartment: item.studentProfile?.department || "University of Nigeria",
              studentLevel: item.studentProfile?.level ? `${item.studentProfile.level} Level` : "Student",
              studentPhone: item.studentUser?.phone || "+234 800 000 0000",
              studentEmail: item.studentUser?.email || "student@unn.edu.ng",
              academicSession: item.booking.academicSession || "2025/2026",
              requestedAt: item.booking.requestedAt,
              expiresAt: item.booking.expiresAt,
              studentNote: item.booking.studentNote,
              status: item.booking.status.toLowerCase() as any,
            }));
            setBookings(mapped);
          }
        }
      } catch (err) {
        console.warn("[LandlordDashboard] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLandlordData();
  }, []);

  const handleApprove = async (bookingId: string) => {
    setProcessingId(bookingId);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/v1/landlord/bookings/${bookingId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionNote: "Approved for physical room inspection." }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b))
        );
        setSummary((prev) => ({
          ...prev,
          pendingRequests: Math.max(0, prev.pendingRequests - 1),
          occupiedUnits: prev.occupiedUnits + 1,
          vacantUnits: Math.max(0, prev.vacantUnits - 1),
        }));

        setActionSuccess("Reservation hold approved. Unlocked student contact details.");
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (bookingId: string) => {
    setRejectTargetId(bookingId);
    setRejectReason("Room currently under physical maintenance or inspection.");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetId) return;
    setProcessingId(rejectTargetId);

    try {
      const res = await fetch(`/api/v1/landlord/bookings/${rejectTargetId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === rejectTargetId ? { ...b, status: "rejected" } : b))
        );
        setSummary((prev) => ({
          ...prev,
          pendingRequests: Math.max(0, prev.pendingRequests - 1),
        }));

        setRejectModalOpen(false);
        setRejectTargetId(null);
        setActionSuccess("Reservation request rejected and room released.");
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");

  const occupancyPercent = summary.totalUnits > 0
    ? Math.round((summary.occupiedUnits / summary.totalUnits) * 100)
    : 0;

  return (
    <div className="w-full text-[#121212] pt-8 sm:pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Overline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
              Lodge Operations & Occupancy
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans">
              Review pending 72-hour reservation holds, verify UNN student credentials, and manage vacancy ledgers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/landlord/verification"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DCD8D0] bg-white hover:bg-[#F3F0EB] text-[#121212] text-xs font-medium transition-colors"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-[#5A5A58]" />
              <span>Audit Documents</span>
            </Link>
            <Link
              href="/landlord/hostels/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-medium transition-colors shadow-xs"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span>List New Lodge</span>
            </Link>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-[#EBF3EE] border border-[#C6DEC3] text-[#1E513A] text-xs font-medium flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-[#1E513A] hover:underline uppercase text-[10px] font-mono font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Unauthorized State */}
        {unauthorized ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E8E5DF] text-center max-w-lg mx-auto shadow-xs space-y-4 my-10">
            <div className="w-12 h-12 rounded-xl bg-[#FAF2EE] text-[#C25E38] flex items-center justify-center mx-auto">
              <HiOutlineLockClosed className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#121212]">
              Landlord Access Required
            </h3>
            <p className="text-xs text-[#5A5A58] leading-relaxed">
              Sign in with your registered Landlord account to inspect your compound vacancy metrics, approve incoming 72-hour student room holds, and list new lodges.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login?redirect=/landlord/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Sign in as Landlord</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Occupancy & Metric Ledgers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#5A5A58] mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Total Compound Units
                  </span>
                  <RiBuildingLine className="w-4 h-4 text-[#5A5A58]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#121212]">
                  {loading ? "..." : summary.totalUnits}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Across {lodges.length} registered campus lodges
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#1E513A] mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Occupied & Reserved
                  </span>
                  <HiShieldCheck className="w-4 h-4 text-[#1E513A]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#1E513A]">
                  {loading ? "..." : summary.occupiedUnits}
                </div>
                <div className="w-full bg-[#E8E5DF] h-1.5 rounded-xs mt-2 overflow-hidden">
                  <div
                    className="bg-[#1E513A] h-full"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1.5 font-sans">
                  {occupancyPercent}% annual tenancy rate
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#C25E38] mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Vacant Units
                  </span>
                  <RiKey2Line className="w-4 h-4 text-[#C25E38]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#C25E38]">
                  {loading ? "..." : summary.vacantUnits}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Directly reserveable by UNN students
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#121212] mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    72h Pending Holds
                  </span>
                  <HiOutlineClock className="w-4 h-4 text-[#121212]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#121212]">
                  {loading ? "..." : pendingBookings.length}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Awaiting your approval or inspection note
                </p>
              </div>
            </div>

            {/* Tabbed Navigation Bar */}
            <div className="flex items-center justify-between border-b border-[#E8E5DF] mt-8">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "pending"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Pending Holds ({pendingBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "approved"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Approved Tenants ({approvedBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("lodges")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "lodges"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Managed Lodges ({lodges.length})
                </button>
              </div>
            </div>

            {/* Tab 1: Pending Student Reservation Holds */}
            {activeTab === "pending" && (
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                      Loading student reservation holds from database...
                    </p>
                  </div>
                ) : pendingBookings.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <HiOutlineCheckCircle className="w-10 h-10 text-[#1E513A] mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-bold text-[#121212]">
                      No pending reservation holds
                    </h3>
                    <p className="text-xs text-[#5A5A58] mt-1 max-w-sm mx-auto">
                      All student reservation holds have been reviewed. When verified UNN students place a 72-hour hold on your rooms, they will appear here.
                    </p>
                  </div>
                ) : (
                  pendingBookings.map((booking) => {
                    const expiresDate = new Date(booking.expiresAt);
                    const hoursLeft = Math.max(
                      0,
                      Math.round((expiresDate.getTime() - Date.now()) / (1000 * 3600))
                    );

                    return (
                      <div
                        key={booking.id}
                        className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                      >
                        {/* Left: Student Profile & UNN Credentials */}
                        <div className="space-y-3 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono tracking-wider uppercase text-[#121212] bg-[#F4F3F0] px-2.5 py-1 rounded-xs font-semibold">
                              HOLD REF: {booking.bookingRef}
                            </span>
                            <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold flex items-center gap-1">
                              <HiOutlineClock className="w-3.5 h-3.5" />
                              {hoursLeft}H REMAINING (72H HOLD)
                            </span>
                            <span className="text-xs text-[#5A5A58]">•</span>
                            <span className="text-xs font-sans text-[#5A5A58]">
                              Session {booking.academicSession}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-serif text-xl font-bold text-[#121212]">
                              {booking.studentName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#5A5A58] mt-1">
                              <span className="flex items-center gap-1 font-mono text-[#121212] font-medium">
                                <HiOutlineAcademicCap className="w-3.5 h-3.5 text-[#5A5A58]" />
                                {booking.studentRegNo}
                              </span>
                              <span>•</span>
                              <span>{booking.studentDepartment}</span>
                              <span>•</span>
                              <span className="font-mono">{booking.studentLevel}</span>
                            </div>
                          </div>

                          {/* Lodge & Room Spec */}
                          <div className="p-3 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1] text-xs space-y-1">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-[#121212] font-serif font-bold">
                                {booking.hostelTitle} — {booking.roomType}
                              </span>
                              <span className="font-mono text-[#C25E38] font-bold">
                                ₦{Number(booking.annualRent).toLocaleString()} / year
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5A5A58]">
                              Zone: {booking.hostelZone}
                            </p>
                            {booking.studentNote && (
                              <div className="mt-2 pt-2 border-t border-[#E8E5DF] text-[11.5px] text-[#333] italic">
                                &ldquo;{booking.studentNote}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Decision Action Buttons */}
                        <div className="flex sm:flex-col lg:flex-row items-center gap-3 shrink-0">
                          <button
                            onClick={() => handleOpenReject(booking.id)}
                            disabled={processingId === booking.id}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors text-center"
                          >
                            Reject Hold
                          </button>
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={processingId === booking.id}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E513A] hover:bg-[#163E2C] text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            <span>{processingId === booking.id ? "Approving..." : "Approve Reservation"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Approved Tenants (Inspected & Verified) */}
            {activeTab === "approved" && (
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                      Loading approved tenant records...
                    </p>
                  </div>
                ) : approvedBookings.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <h3 className="font-serif text-lg font-bold text-[#121212]">
                      No approved tenants yet
                    </h3>
                    <p className="text-xs text-[#5A5A58] mt-1 max-w-sm mx-auto">
                      When you approve a student reservation, their unlocked UNN credentials and direct contact information appear here for final tenancy coordination.
                    </p>
                  </div>
                ) : (
                  approvedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#1E513A] bg-[#EBF3EE] px-2 py-0.5 rounded-xs font-semibold">
                            APPROVED TENANT
                          </span>
                          <span className="text-xs font-mono text-[#5A5A58]">
                            REF: {booking.bookingRef}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#121212]">
                          {booking.studentName}
                        </h3>
                        <p className="text-xs text-[#5A5A58]">
                          {booking.studentDepartment} • UNN Reg: <span className="font-mono font-medium text-[#121212]">{booking.studentRegNo}</span>
                        </p>

                        <div className="text-xs text-[#5A5A58]">
                          Reserved: <span className="font-medium text-[#121212]">{booking.hostelTitle}</span> ({booking.roomType})
                        </div>
                      </div>

                      {/* Unlocked Contact Details */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <a
                          href={`tel:${booking.studentPhone}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-[#F8F7F4] hover:bg-white text-xs font-medium text-[#121212] transition-colors"
                        >
                          <HiOutlinePhone className="w-4 h-4 text-[#C25E38]" />
                          <span>{booking.studentPhone}</span>
                        </a>
                        <a
                          href={`mailto:${booking.studentEmail}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-[#F8F7F4] hover:bg-white text-xs font-medium text-[#121212] transition-colors"
                        >
                          <HiOutlineEnvelope className="w-4 h-4 text-[#5A5A58]" />
                          <span>Email Student</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Managed Lodges */}
            {activeTab === "lodges" && (
              <div className="mt-6">
                {loading ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                      Loading your managed lodges...
                    </p>
                  </div>
                ) : lodges.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF] space-y-3">
                    <RiBuildingLine className="w-10 h-10 text-[#C25E38] mx-auto opacity-70" />
                    <h3 className="font-serif text-lg font-bold text-[#121212]">
                      No lodges registered yet
                    </h3>
                    <p className="text-xs text-[#5A5A58] max-w-sm mx-auto">
                      List your campus compound to start receiving direct room reservations from verified UNN students with zero middleman fees.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/landlord/hostels/new"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>List Your First Lodge</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lodges.map((lodge) => (
                      <div
                        key={lodge.id}
                        className="rounded-2xl bg-white border border-[#E8E5DF] overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div className="relative h-44 sm:h-52 w-full bg-[#121212]">
                          <Image
                            src={lodge.primaryImage}
                            alt={lodge.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xs text-[10px] font-mono uppercase tracking-wider font-semibold text-[#121212]">
                            ZONE: {lodge.zone}
                          </div>
                          <div className="absolute top-3 right-3 bg-[#1E513A] px-2.5 py-1 rounded-xs text-[10px] font-mono uppercase tracking-wider font-semibold text-white">
                            VERIFIED LODGE
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-[#121212]">
                              {lodge.title}
                            </h3>
                            <p className="text-xs text-[#5A5A58] mt-1 font-sans">
                              {lodge.streetText}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1] text-center">
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[#5A5A58]">
                                Total Units
                              </div>
                              <div className="font-mono text-base font-bold text-[#121212]">
                                {lodge.totalUnits}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[#1E513A]">
                                Occupied
                              </div>
                              <div className="font-mono text-base font-bold text-[#1E513A]">
                                {lodge.occupiedUnits}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[#C25E38]">
                                Available
                              </div>
                              <div className="font-mono text-base font-bold text-[#C25E38]">
                                {lodge.vacantUnits}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="font-mono text-xs font-bold text-[#121212]">
                              From ₦{lodge.minRent.toLocaleString()} / year
                            </span>
                            <Link
                              href={`/hostels/${lodge.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#C25E38] hover:underline"
                            >
                              <span>Public Listing</span>
                              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#121212]">
              Reject Reservation Hold
            </h3>
            <p className="text-xs text-[#5A5A58]">
              State the reason for releasing this student reservation hold. An automated notification will be sent to the student.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Room taken by prior student inspection or unit undergoing electrical repair."
              className="w-full p-3 rounded-xl border border-[#DCD8D0] bg-[#F8F7F4] text-xs font-sans text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#5A5A58] hover:bg-[#F0EEEA]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
