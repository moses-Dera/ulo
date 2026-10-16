"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HostelGallery } from "./HostelGallery";
import { ReservationCard } from "./ReservationCard";
import { BookingModal } from "./BookingModal";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  HiShieldCheck,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import {
  RiWalkLine,
  RiDropLine,
  RiFlashlightLine,
  RiShieldCheckLine,
  RiBuildingLine,
} from "react-icons/ri";

interface HostelDetailViewProps {
  hostel: {
    id: string;
    title: string;
    description: string;
    rules?: string | null;
    zone: string;
    streetText?: string | null;
    nearestGateName?: string | null;
    walkTimeBand?: string | null;
    images: Array<{
      id: string;
      storageKey: string;
      thumbKey?: string;
      tag?: string;
      isPrimary?: boolean;
    }>;
    roomTypes: Array<{
      id: string;
      label: string;
      annualRent: number | string;
      totalUnits: number;
      description?: string | null;
    }>;
    amenities: Array<{
      id: string;
      name: string;
    }>;
    gateDistances?: Array<{
      gateId: string;
      gateName: string;
      distanceM: number;
    }>;
  };
}

export function HostelDetailView({ hostel }: HostelDetailViewProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    hostel.roomTypes[0]?.id || ""
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const activeRoom =
    hostel.roomTypes.find((r) => r.id === selectedRoomId) ||
    hostel.roomTypes[0] || {
      id: "default",
      label: "Standard Unit",
      annualRent: 200000,
    };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-mono text-[#5A5A58] mb-5">
            <Link href="/" className="hover:text-[#121212] transition-colors">
              Ụlọ
            </Link>
            <HiOutlineChevronRight className="w-3 h-3 text-[#E8E5DF]" />
            <Link href={`/?zone=${encodeURIComponent(hostel.zone)}`} className="hover:text-[#121212] transition-colors">
              {hostel.zone}
            </Link>
            <HiOutlineChevronRight className="w-3 h-3 text-[#E8E5DF]" />
            <span className="text-[#121212] font-semibold truncate max-w-[200px]">
              {hostel.title}
            </span>
          </nav>

          {/* Header Title & Badges */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#121212]">
                {hostel.title}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-mono text-[#5A5A58]">
                <span className="font-semibold text-[#121212]">{hostel.zone}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 text-[#1E513A]">
                  <RiWalkLine className="w-4 h-4 text-[#1E513A]" />
                  <span>5 mins to {hostel.nearestGateName || "Campus Gate"}</span>
                </span>
                {hostel.streetText && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineMapPin className="w-3.5 h-3.5 text-[#5A5A58]" />
                      <span>{hostel.streetText}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-[#121212] text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-lg border-l-2 border-[#C25E38] flex items-center gap-1.5 shadow-xs">
                <HiShieldCheck className="w-4 h-4 text-[#C25E38]" />
                <span>VERIFIED LODGE</span>
              </div>
            </div>
          </div>

          {/* 2-Column Architectural Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (65% width): Gallery, Specs, Curfew, Description */}
            <div className="lg:col-span-8 space-y-10">
              {/* Photo Gallery */}
              <HostelGallery images={hostel.images} title={hostel.title} />

              {/* Audited Utilities & Facilities Matrix */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#121212] tracking-tight">
                    Audited Campus Living Standards
                  </h3>
                  <p className="text-xs text-[#5A5A58] mt-1 font-mono">
                    Physically inspected and verified by Ụlọ student field officers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF]/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]">
                      <RiDropLine className="w-4 h-4 text-[#1E513A]" />
                      <span>Water Supply Reliability</span>
                    </div>
                    <p className="text-xs text-[#5A5A58] leading-relaxed">
                      Borehole connected with overhead PVC storage tanks. Steady running water in room toilets.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF]/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]">
                      <RiFlashlightLine className="w-4 h-4 text-[#C25E38]" />
                      <span>Electricity & Power Schedule</span>
                    </div>
                    <p className="text-xs text-[#5A5A58] leading-relaxed">
                      Dedicated compound transformer with scheduled standby generator coverage during public outages.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF]/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]">
                      <RiShieldCheckLine className="w-4 h-4 text-[#121212]" />
                      <span>Security & Compound Curfew</span>
                    </div>
                    <p className="text-xs text-[#5A5A58] leading-relaxed">
                      Perimeter fence with locked security gate. Curfew at 10:00 PM for student safety.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF]/70 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]">
                      <RiWalkLine className="w-4 h-4 text-[#1E513A]" />
                      <span>Campus Gate Access</span>
                    </div>
                    <p className="text-xs text-[#5A5A58] leading-relaxed">
                      5 minutes gentle walking distance to {hostel.nearestGateName || "Campus Gate"}. Low bike shuttle dependency.
                    </p>
                  </div>
                </div>

                {/* Amenity Badges */}
                <div className="pt-2">
                  <span className="block text-[10px] font-mono tracking-wider uppercase text-[#5A5A58] mb-2.5 font-semibold">
                    Verified Compound Inclusions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {hostel.amenities.map((a) => (
                      <span
                        key={a.id}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#DCD8D0] text-xs font-medium text-[#121212]"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Property Description */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E5DF] shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#121212] tracking-tight">
                  About {hostel.title}
                </h3>
                <p className="text-sm sm:text-base text-[#5A5A58] leading-relaxed whitespace-pre-line">
                  {hostel.description}
                </p>

                {hostel.rules && (
                  <div className="mt-6 pt-6 border-t border-[#E8E5DF] space-y-2">
                    <span className="text-[10.5px] font-mono tracking-wider uppercase text-[#C25E38] font-semibold block">
                      Compound Rules & Tenancy Guidelines
                    </span>
                    <p className="text-xs text-[#5A5A58] leading-relaxed bg-[#FAF2EE] p-3.5 rounded-2xl border border-[#C25E38]/20">
                      {hostel.rules}
                    </p>
                  </div>
                )}
              </div>

              {/* Landlord Credibility Profile Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#C25E38] font-semibold block">
                    Zero Agent Fee Policy
                  </span>
                  <h4 className="font-serif text-xl font-bold">
                    Direct Landlord Booking
                  </h4>
                  <p className="text-xs text-[#E8E5DF]/70 max-w-md leading-relaxed">
                    When the landlord accepts your reservation hold, their verified contact and compound directions unlock directly on your dashboard.
                  </p>
                </div>

                <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-xs font-mono text-[#FAF2EE] shrink-0">
                  NIN Verified Landlord
                </div>
              </div>
            </div>

            {/* Right Column (35% width): Floating Reservation Card */}
            <div className="lg:col-span-4">
              <ReservationCard
                rooms={hostel.roomTypes}
                selectedRoomId={selectedRoomId}
                onSelectRoom={(id) => setSelectedRoomId(id)}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
                nearestGateName={hostel.nearestGateName || undefined}
                walkMinutes={5}
                isVerified={true}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal Sheet */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        hostelId={hostel.id}
        hostelTitle={hostel.title}
        selectedRoom={activeRoom}
      />
    </div>
  );
}
