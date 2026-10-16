"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentCheck,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineIdentification,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLockClosed,
  HiArrowRight,
} from "react-icons/hi2";
import { RiBuildingLine, RiGovernmentLine } from "react-icons/ri";

export interface PendingVerification {
  landlordId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  documents: Array<{
    id: string;
    docType: string;
    storageKey: string;
    uploadedAt: string;
  }>;
}

export interface PendingListing {
  hostel: {
    id: string;
    title: string;
    zone: string;
    streetText: string;
    exactAddress?: string;
    walkTimeBand: string;
    status: string;
    createdAt: string;
  };
  landlordName: string;
  landlordEmail: string;
}

export interface AdminMetrics {
  totalUsers: number;
  studentsCount: number;
  landlordsCount: number;
  verifiedLandlordsCount: number;
  publishedHostelsCount: number;
  pendingListingsCount: number;
  totalBookings: number;
  approvedBookings: number;
  approvalRatePercentage: number;
  hostelsByZone: Record<string, number>;
}

export function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<"verifications" | "listings" | "zones">("verifications");
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    studentsCount: 0,
    landlordsCount: 0,
    verifiedLandlordsCount: 0,
    publishedHostelsCount: 0,
    pendingListingsCount: 0,
    totalBookings: 0,
    approvedBookings: 0,
    approvalRatePercentage: 0,
    hostelsByZone: {},
  });

  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectType, setRejectType] = useState<"verification" | "listing">("verification");
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Live fetch from PostgreSQL backend
  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        const [mRes, vRes, lRes] = await Promise.all([
          fetch("/api/v1/admin/metrics"),
          fetch("/api/v1/admin/verifications"),
          fetch("/api/v1/admin/listings/pending"),
        ]);

        if (mRes.status === 401 || vRes.status === 401 || lRes.status === 401 ||
            mRes.status === 403 || vRes.status === 403 || lRes.status === 403) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        if (mRes.ok) {
          const mData = await mRes.json();
          if (mData.success && mData.data) {
            setMetrics(mData.data);
          }
        }

        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.success && Array.isArray(vData.data)) {
            setVerifications(vData.data);
          }
        }

        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData.success && Array.isArray(lData.data)) {
            setPendingListings(lData.data);
          }
        }
      } catch (err) {
        console.warn("[AdminDashboard] Live fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  // Approve Landlord
  const handleApproveVerification = async (landlordId: string) => {
    setProcessingId(landlordId);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/v1/admin/verifications/${landlordId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setVerifications((prev) => prev.filter((v) => v.landlordId !== landlordId));
        setMetrics((prev) => ({
          ...prev,
          verifiedLandlordsCount: prev.verifiedLandlordsCount + 1,
        }));

        setActionSuccess("Landlord identity and property ownership audited & verified.");
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Approve landlord failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (id: string, type: "verification" | "listing") => {
    setRejectTargetId(id);
    setRejectType(type);
    setRejectReason(
      type === "verification"
        ? "Document resolution illegible or address does not match UNN university records."
        : "Incomplete amenity verification or missing mandatory compound rules."
    );
    setRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectTargetId) return;
    setProcessingId(rejectTargetId);

    try {
      if (rejectType === "verification") {
        const res = await fetch(`/api/v1/admin/verifications/${rejectTargetId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        });
        if (res.ok) {
          setVerifications((prev) => prev.filter((v) => v.landlordId !== rejectTargetId));
          setActionSuccess("Landlord verification rejected with audit notes.");
        }
      } else {
        const res = await fetch(`/api/v1/admin/listings/${rejectTargetId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        });
        if (res.ok) {
          setPendingListings((prev) => prev.filter((l) => l.hostel.id !== rejectTargetId));
          setActionSuccess("Lodge listing rejected and landlord notified.");
        }
      }

      setRejectModalOpen(false);
      setRejectTargetId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error("Reject action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Approve Listing
  const handleApproveListing = async (hostelId: string) => {
    setProcessingId(hostelId);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/v1/admin/listings/${hostelId}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        setPendingListings((prev) => prev.filter((l) => l.hostel.id !== hostelId));
        setMetrics((prev) => ({
          ...prev,
          publishedHostelsCount: prev.publishedHostelsCount + 1,
          pendingListingsCount: Math.max(0, prev.pendingListingsCount - 1),
        }));

        setActionSuccess("Hostel published to UNN student discovery directory.");
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Approve listing failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full text-[#121212] pt-8 sm:pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#121212]">
              Administrative Moderation Console
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 font-sans">
              Audit landlord identity documents, inspect submitted student lodges, and maintain zero-fraud safety for UNN Nsukka.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DCD8D0] bg-white hover:bg-[#F3F0EB] text-[#121212] text-xs font-medium transition-colors"
            >
              <span>View Public Directory</span>
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-[#5A5A58]" />
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
              Admin Authentication Required
            </h3>
            <p className="text-xs text-[#5A5A58] leading-relaxed">
              This console is restricted to Ụlọ compliance administrators for auditing landlord identity documentation and approving student lodge listings.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login?redirect=/admin"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Sign in as Administrator</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Platform Governance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#5A5A58] mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Students
                  </span>
                  <HiOutlineUserGroup className="w-4 h-4 text-[#5A5A58]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#121212]">
                  {loading ? "..." : metrics.studentsCount}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Verified UNN scholars
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#1E513A] mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Verified Landlords
                  </span>
                  <HiShieldCheck className="w-4 h-4 text-[#1E513A]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#1E513A]">
                  {loading ? "..." : metrics.verifiedLandlordsCount}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Audited property owners
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#121212] mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Campus Lodges
                  </span>
                  <RiBuildingLine className="w-4 h-4 text-[#121212]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#121212]">
                  {loading ? "..." : metrics.publishedHostelsCount}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Published across 4 zones
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#C25E38] mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Pending Audits
                  </span>
                  <HiOutlineDocumentCheck className="w-4 h-4 text-[#C25E38]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#C25E38]">
                  {loading ? "..." : verifications.length}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  Landlord document reviews
                </p>
              </div>

              <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
                <div className="flex items-center justify-between text-[#121212] mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Hold Conversion
                  </span>
                  <HiOutlineClock className="w-4 h-4 text-[#121212]" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#121212]">
                  {loading ? "..." : `${metrics.approvalRatePercentage}%`}
                </div>
                <p className="text-[11px] text-[#5A5A58] mt-1 font-sans">
                  72h hold approval rate
                </p>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex items-center justify-between border-b border-[#E8E5DF] mt-8">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("verifications")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "verifications"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Landlord Identity Audits ({verifications.length})
                </button>
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "listings"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Lodge Listing Submissions ({pendingListings.length})
                </button>
                <button
                  onClick={() => setActiveTab("zones")}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === "zones"
                      ? "text-[#121212] font-semibold border-b-2 border-[#121212]"
                      : "text-[#5A5A58] hover:text-[#121212]"
                  }`}
                >
                  Campus Zone Topology
                </button>
              </div>
            </div>

            {/* Tab 1: Landlord Document Audits */}
            {activeTab === "verifications" && (
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                      Loading landlord audit records...
                    </p>
                  </div>
                ) : verifications.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <HiOutlineCheckCircle className="w-10 h-10 text-[#1E513A] mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-bold text-[#121212]">
                      Verification queue is clear
                    </h3>
                    <p className="text-xs text-[#5A5A58] mt-1 max-w-sm mx-auto">
                      All submitted landlord ownership documents and National Identity Slips have been audited.
                    </p>
                  </div>
                ) : (
                  verifications.map((item) => (
                    <div
                      key={item.landlordId}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                    >
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] bg-[#F8F7F4] px-2 py-0.5 rounded-xs font-semibold">
                            PENDING AUDIT
                          </span>
                          <span className="text-xs font-mono text-[#5A5A58]">
                            ID: {item.landlordId.slice(0, 8)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#121212]">
                            {item.fullName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#5A5A58] mt-1">
                            <span className="flex items-center gap-1">
                              <HiOutlinePhone className="w-3.5 h-3.5 text-[#5A5A58]" />
                              {item.phone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <HiOutlineEnvelope className="w-3.5 h-3.5 text-[#5A5A58]" />
                              {item.email}
                            </span>
                          </div>
                        </div>

                        {/* Submitted Documents List */}
                        <div className="p-3.5 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1] space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] font-semibold block">
                            Submitted Verification Records ({item.documents.length})
                          </span>
                          {item.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-start gap-2 text-xs font-sans text-[#121212]"
                            >
                              <HiOutlineIdentification className="w-4 h-4 text-[#C25E38] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-mono text-[10px] uppercase font-bold text-[#5A5A58] mr-2">
                                  [{doc.docType.replace("_", " ")}]
                                </span>
                                {doc.storageKey.startsWith("/") || doc.storageKey.startsWith("http") ? (
                                  <a
                                    href={doc.storageKey}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#1E513A] underline font-medium hover:text-[#121212]"
                                  >
                                    View Uploaded Document &rarr;
                                  </a>
                                ) : (
                                  <span>{doc.storageKey}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col lg:flex-row items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleOpenReject(item.landlordId, "verification")}
                          disabled={processingId === item.landlordId}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                        >
                          Reject Audit
                        </button>
                        <button
                          onClick={() => handleApproveVerification(item.landlordId)}
                          disabled={processingId === item.landlordId}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E513A] hover:bg-[#163E2C] text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <HiShieldCheck className="w-4 h-4" />
                          <span>{processingId === item.landlordId ? "Auditing..." : "Verify Landlord"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Lodge Listing Submissions */}
            {activeTab === "listings" && (
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#5A5A58]">
                      Loading pending listing submissions...
                    </p>
                  </div>
                ) : pendingListings.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E8E5DF]">
                    <HiOutlineCheckCircle className="w-10 h-10 text-[#1E513A] mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-bold text-[#121212]">
                      No pending listing submissions
                    </h3>
                    <p className="text-xs text-[#5A5A58] mt-1 max-w-sm mx-auto">
                      All newly submitted campus lodges have been audited and published to the student search directory.
                    </p>
                  </div>
                ) : (
                  pendingListings.map((item) => (
                    <div
                      key={item.hostel.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#121212] bg-[#F4F3F0] px-2 py-0.5 rounded-xs font-semibold">
                            ZONE: {item.hostel.zone}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold">
                            {item.hostel.walkTimeBand.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#121212]">
                          {item.hostel.title}
                        </h3>
                        <p className="text-xs text-[#5A5A58]">
                          Landmark: <span className="font-medium text-[#121212]">{item.hostel.streetText}</span>
                        </p>
                        {item.hostel.exactAddress && (
                          <p className="text-xs text-[#5A5A58]">
                            Exact Compound: <span className="font-mono text-[#121212]">{item.hostel.exactAddress}</span>
                          </p>
                        )}
                        <p className="text-xs text-[#5A5A58]">
                          Listed by: <span className="font-medium text-[#121212]">{item.landlordName}</span> ({item.landlordEmail})
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col lg:flex-row items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleOpenReject(item.hostel.id, "listing")}
                          disabled={processingId === item.hostel.id}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                        >
                          Reject Listing
                        </button>
                        <button
                          onClick={() => handleApproveListing(item.hostel.id)}
                          disabled={processingId === item.hostel.id}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          <span>{processingId === item.hostel.id ? "Publishing..." : "Approve & Publish"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Campus Zone Topology */}
            {activeTab === "zones" && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(metrics.hostelsByZone).length === 0 ? (
                    <div className="col-span-full p-6 text-center rounded-2xl bg-white border border-[#E8E5DF] text-xs text-[#5A5A58]">
                      Zone distribution metrics are calculated as new lodges are published.
                    </div>
                  ) : (
                    Object.entries(metrics.hostelsByZone).map(([zName, count]) => (
                      <div
                        key={zName}
                        className="p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs"
                      >
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E38] font-semibold">
                          UNN Campus Zone
                        </span>
                        <h4 className="font-serif text-lg font-bold text-[#121212] mt-1">
                          {zName}
                        </h4>
                        <div className="font-mono text-2xl font-bold text-[#121212] mt-2">
                          {count} {count === 1 ? "Lodge" : "Lodges"}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#121212]">
                    UNN Primary Campus Gates Reference
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1]">
                      <div className="font-serif font-bold text-sm text-[#121212]">Second Gate (Behind Flat)</div>
                      <p className="text-xs text-[#5A5A58] mt-1">Coordinates: 6.86872° N, 7.40935° E</p>
                      <p className="text-[11px] text-[#1E513A] mt-1 font-mono">Proximate to Franco, Faculty of Arts & Social Sciences</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1]">
                      <div className="font-serif font-bold text-sm text-[#121212]">Odim Gate</div>
                      <p className="text-xs text-[#5A5A58] mt-1">Coordinates: 6.86210° N, 7.41890° E</p>
                      <p className="text-[11px] text-[#1E513A] mt-1 font-mono">Direct access to Veterinary Medicine & Pharmaceutical Sciences</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1]">
                      <div className="font-serif font-bold text-sm text-[#121212]">Hilltop Gate (Charly&apos;s Gate)</div>
                      <p className="text-xs text-[#5A5A58] mt-1">Coordinates: 6.87750° N, 7.41120° E</p>
                      <p className="text-[11px] text-[#1E513A] mt-1 font-mono">Connects to Physical Sciences & Engineering lecture halls</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#EAE7E1]">
                      <div className="font-serif font-bold text-sm text-[#121212]">Main Gate (Abuja Building)</div>
                      <p className="text-xs text-[#5A5A58] mt-1">Coordinates: 6.85820° N, 7.40510° E</p>
                      <p className="text-[11px] text-[#1E513A] mt-1 font-mono">Vice-Chancellor&apos;s Secretariat & Nnamdi Azikiwe Library</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#121212]">
              {rejectType === "verification" ? "Reject Landlord Audit" : "Reject Lodge Listing"}
            </h3>
            <p className="text-xs text-[#5A5A58]">
              State the audit compliance reason. The landlord will receive an automated notification with these details.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
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
