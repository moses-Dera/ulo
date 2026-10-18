"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { DashboardFooter } from "@/components/layout/DashboardFooter";
import {
  HiShieldCheck,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "student" | "landlord" | "admin";
  status: string;
  emailVerifiedAt: string | null;
  student?: {
    regNumber: string;
    department: string;
  };
  landlord?: {
    verificationStatus: "unverified" | "pending" | "verified" | "rejected";
    verificationReason: string | null;
    verifiedAt: string | null;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/users/profile");
      if (res.status === 401) {
        router.push("/auth/login?redirect=/profile");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setEditFullName(json.data.fullName || "");
        setEditPhone(json.data.phone || "");
        setEditDepartment(json.data.student?.department || "");
      } else {
        setError(json.error?.message || "Failed to load profile");
      }
    } catch {
      setError("An unexpected error occurred while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const endpoint =
        profile.role === "student"
          ? "/api/v1/users/profile/student"
          : "/api/v1/users/profile/landlord";

      const payload =
        profile.role === "student"
          ? {
              fullName: editFullName,
              phone: editPhone || undefined,
              department: editDepartment || undefined,
            }
          : {
              fullName: editFullName,
              phone: editPhone || undefined,
            };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setSaveSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setSaveError(json.error?.message || "Failed to update profile");
      }
    } catch {
      setSaveError("An error occurred while saving profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        window.location.href = "/?deleted=true";
      } else {
        alert(json.error?.message || "Failed to delete account");
      }
    } catch {
      alert("Error occurred while processing request");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col">
        <header className="h-16 border-b border-[#E8E5DF] bg-[#F9F8F6] flex items-center px-6">
          <span className="font-serif text-xl font-bold text-[#121212]">Ụlọ.</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-10 h-10 border-3 border-[#C25E38] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-serif italic text-[#5A5A58]">Retrieving verified UNN profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col">
        <header className="h-16 border-b border-[#E8E5DF] bg-[#F9F8F6] flex items-center px-6">
          <Link href="/" className="font-serif text-xl font-bold text-[#121212]">Ụlọ.</Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <HiOutlineExclamationTriangle className="w-12 h-12 text-[#C25E38] mb-3" />
          <h1 className="font-serif text-2xl font-bold text-[#121212] mb-2">Unable to Load Profile</h1>
          <p className="text-sm text-[#5A5A58] mb-6">{error || "Please sign in to access your profile settings."}</p>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-[#121212] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const roleTitle =
    profile.role === "landlord"
      ? "Verified Landlord"
      : profile.role === "admin"
      ? "Platform Administrator"
      : "UNN Student";

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "Ụ";

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      <DashboardNav role={profile.role} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E8E5DF]">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121212] text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold tracking-tight shadow-sm relative">
                <span>{initials}</span>
                {profile.role === "landlord" && profile.landlord?.verificationStatus === "verified" && (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-[#1E513A] rounded-md text-white border-2 border-white shadow-xs">
                    <HiShieldCheck className="w-4 h-4" />
                  </span>
                )}
                {profile.role === "student" && (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-[#C25E38] rounded-md text-white border-2 border-white shadow-xs">
                    <HiOutlineAcademicCap className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#121212]">
                    {profile.fullName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold ${
                      profile.role === "landlord"
                        ? "bg-[#EBF3ED] text-[#1E513A] border border-[#C5DEC9]"
                        : profile.role === "admin"
                        ? "bg-[#FAF2EE] text-[#C25E38] border border-[#ECCDC1]"
                        : "bg-[#F3F0EB] text-[#121212] border border-[#E8E5DF]"
                    }`}
                  >
                    {profile.role === "landlord" && <HiShieldCheck className="w-3.5 h-3.5" />}
                    {profile.role === "student" && <HiOutlineAcademicCap className="w-3.5 h-3.5" />}
                    {profile.role === "admin" && <HiOutlineClipboardDocumentCheck className="w-3.5 h-3.5" />}
                    <span>{roleTitle}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5A5A58] mt-1 flex items-center gap-2 flex-wrap">
                  <span>{profile.email}</span>
                  <span className="text-[#DCD8D0]">•</span>
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  <span className="text-[#DCD8D0]">•</span>
                  <span className="inline-flex items-center gap-1 text-[#1E513A] font-medium text-xs">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Active Account
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isEditing
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-white text-[#121212] border-[#DCD8D0] hover:bg-[#F3F0EB]"
                }`}
              >
                <HiOutlinePencilSquare className="w-4 h-4" />
                <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            {profile.role === "student" && (
              <>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    Matric / Reg No
                  </span>
                  <p className="font-mono text-base font-bold text-[#121212] mt-0.5">
                    {profile.student?.regNumber || "Pending Registration"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    Academic Department
                  </span>
                  <p className="text-sm font-semibold text-[#121212] mt-0.5 truncate">
                    {profile.student?.department || "General Studies"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                      72h Student Holds
                    </span>
                    <p className="text-sm font-semibold text-[#121212] mt-0.5">Active UNN Session</p>
                  </div>
                  <Link
                    href="/dashboard/bookings"
                    className="p-2 rounded-lg bg-white border border-[#E8E5DF] text-[#C25E38] hover:bg-[#FAF2EE] transition-colors"
                    title="View My Bookings"
                  >
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}

            {profile.role === "landlord" && (
              <>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    Audit Status
                  </span>
                  <p className="text-sm font-semibold text-[#1E513A] mt-0.5 capitalize flex items-center gap-1.5">
                    <HiShieldCheck className="w-4 h-4" />
                    {profile.landlord?.verificationStatus || "Pending"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    Verification Date
                  </span>
                  <p className="text-sm font-semibold text-[#121212] mt-0.5">
                    {profile.landlord?.verifiedAt
                      ? new Date(profile.landlord.verifiedAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Awaiting Documentation"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                      Occupancy Ledger
                    </span>
                    <p className="text-sm font-semibold text-[#121212] mt-0.5">Manage Lodge Units</p>
                  </div>
                  <Link
                    href="/landlord/dashboard"
                    className="p-2 rounded-lg bg-white border border-[#E8E5DF] text-[#1E513A] hover:bg-[#EBF3ED] transition-colors"
                    title="Open Landlord Console"
                  >
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}

            {profile.role === "admin" && (
              <>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    Authority Level
                  </span>
                  <p className="text-sm font-semibold text-[#C25E38] mt-0.5">
                    Super Admin Console
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                    System Moderation
                  </span>
                  <p className="text-sm font-semibold text-[#121212] mt-0.5">All UNN Lodges & Gate Mappings</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#5A5A58]">
                      Moderation Queue
                    </span>
                    <p className="text-sm font-semibold text-[#121212] mt-0.5">View Reports & Listings</p>
                  </div>
                  <Link
                    href="/admin"
                    className="p-2 rounded-lg bg-white border border-[#E8E5DF] text-[#C25E38] hover:bg-[#FAF2EE] transition-colors"
                    title="Open Admin Console"
                  >
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Form (if active) */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-[#C25E38]/30 p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E5DF]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#121212]">Edit Profile Information</h2>
                <p className="text-xs text-[#5A5A58]">Update your personal contact details and academic records.</p>
              </div>
              <span className="text-xs font-mono uppercase text-[#C25E38] font-semibold bg-[#FAF2EE] px-2.5 py-1 rounded-md">
                Live Changes
              </span>
            </div>

            {saveSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#EBF3ED] border border-[#C5DEC9] text-[#1E513A] text-xs font-medium flex items-center gap-2">
                <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-[#121212] uppercase tracking-wider mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    placeholder="e.g. Chinedu Okeke"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-[#F9F8F6] text-sm text-[#121212] focus:outline-none focus:border-[#C25E38] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#121212] uppercase tracking-wider mb-1.5">
                    Phone Number (Nigerian Mobile)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. +2348012345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-[#F9F8F6] text-sm text-[#121212] focus:outline-none focus:border-[#C25E38] focus:bg-white transition-colors font-mono"
                  />
                  <span className="text-[10.5px] text-[#5A5A58] mt-1 block">
                    Used for SMS notifications on booking decision updates.
                  </span>
                </div>

                {profile.role === "student" && (
                  <div>
                    <label className="block text-xs font-medium text-[#121212] uppercase tracking-wider mb-1.5">
                      Academic Department
                    </label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      placeholder="e.g. Electronic Engineering"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-[#F9F8F6] text-sm text-[#121212] focus:outline-none focus:border-[#C25E38] focus:bg-white transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-white text-xs font-medium text-[#5A5A58] hover:bg-[#F3F0EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#C25E38] hover:bg-[#A84E2D] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Detailed Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Verified Credentials */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-[#121212] mb-1">Account & Identity Details</h2>
            <p className="text-xs text-[#5A5A58] mb-6">Authentic verification records managed by UNN Ụlọ platform.</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                <HiOutlineEnvelope className="w-5 h-5 text-[#5A5A58] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-[#5A5A58] block">Primary Email</span>
                  <span className="text-sm font-medium text-[#121212]">{profile.email}</span>
                  <span className="block text-[11px] text-[#1E513A] font-medium mt-0.5">
                    ✓ Verified UNN institutional email
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                <HiOutlinePhone className="w-5 h-5 text-[#5A5A58] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-[#5A5A58] block">Mobile Contact</span>
                  <span className="text-sm font-medium text-[#121212] font-mono">
                    {profile.phone || "No phone number added"}
                  </span>
                  <span className="block text-[11px] text-[#5A5A58] mt-0.5">
                    {profile.phone ? "Direct SMS communication active" : "Add phone to receive instant booking alerts"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF]">
                <HiOutlineIdentification className="w-5 h-5 text-[#5A5A58] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-[#5A5A58] block">
                    {profile.role === "student"
                      ? "Matriculation Registration"
                      : profile.role === "landlord"
                      ? "Landlord Registry Reference"
                      : "Security Access Key"}
                  </span>
                  <span className="text-sm font-medium font-mono text-[#121212]">
                    {profile.role === "student"
                      ? profile.student?.regNumber || "Pending Enrollment"
                      : profile.role === "landlord"
                      ? `VERIFIED-LL-${profile.id.slice(0, 8).toUpperCase()}`
                      : `ADMIN-${profile.id.slice(0, 8).toUpperCase()}`}
                  </span>
                  {profile.role === "landlord" && profile.landlord?.verificationReason && (
                    <span className="block text-[11px] text-[#1E513A] mt-1 italic">
                      “{profile.landlord.verificationReason}”
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Privacy, Security & NDPA 2023 */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#121212] mb-1">
                Data Protection & Privacy
              </h2>
              <p className="text-xs text-[#5A5A58] mb-6">
                Guaranteed student privacy compliance under the Nigeria Data Protection Act (NDPA) 2023.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E8E5DF] bg-[#F9F8F6]">
                  <h3 className="text-xs font-semibold text-[#121212] uppercase tracking-wider mb-1">
                    NDPA 2023 Data Safeguard
                  </h3>
                  <p className="text-xs text-[#5A5A58] leading-relaxed">
                    Ụlọ stores your campus credentials solely for verification and hostel booking holds. We never sell student data or disclose private student phone numbers to unverified third parties.
                  </p>
                  <Link
                    href="/legal/privacy"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#C25E38] hover:underline mt-2.5"
                  >
                    <span>Read Full Privacy Notice</span>
                    <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <h3 className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-1">
                    Account Deletion & Data Erasure
                  </h3>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Under NDPA 2023 "Right to Erasure", you may permanently anonymize and delete your Ụlọ account and all associated personal data.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    <span>Request Account Anonymization</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#5A5A58]">
              <span>Session: Secure TLS 1.3</span>
              <span className="font-mono text-[10.5px]">ID: {profile.id.slice(0, 13)}...</span>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E8E5DF] shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
              <HiOutlineTrash className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#121212] mb-2">
              Anonymize & Delete Account?
            </h3>
            <p className="text-xs text-[#5A5A58] leading-relaxed mb-6">
              This action will scrub your name, email, phone number, and student credentials from the active database in accordance with NDPA 2023 regulations. You will immediately be signed out.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-[#DCD8D0] bg-white text-xs font-medium text-[#121212] hover:bg-[#F3F0EB] transition-colors"
              >
                Keep Account
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? "Anonymizing..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
