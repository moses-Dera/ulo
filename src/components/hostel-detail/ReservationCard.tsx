"use client";

import React from "react";
import { HiShieldCheck, HiArrowRight, HiOutlineBolt } from "react-icons/hi2";
import { RiWalkLine } from "react-icons/ri";

export interface RoomOption {
  id: string;
  label: string;
  annualRent: number | string;
  totalUnits: number;
  description?: string | null;
}

interface ReservationCardProps {
  rooms: RoomOption[];
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
  onOpenBookingModal: () => void;
  nearestGateName?: string;
  walkMinutes?: number;
  isVerified?: boolean;
}

export function ReservationCard({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onOpenBookingModal,
  nearestGateName,
  walkMinutes = 5,
  isVerified = true,
}: ReservationCardProps) {
  const activeRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const formattedRent = activeRoom
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(Number(activeRoom.annualRent))
    : "₦0";

  return (
    <>
      {/* Desktop Sticky Reservation Card */}
      <div className="hidden lg:block sticky top-28 w-full p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E5DF] shadow-lg shadow-black/[0.03]">
        {/* Price Header */}
        <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-[#E8E5DF]">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#5A5A58] block mb-0.5 font-semibold">
              Official Annual Rent
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-3xl font-bold text-[#121212]">
                {formattedRent}
              </span>
              <span className="text-xs text-[#5A5A58] font-mono">/ session</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-[#EBF3EE] text-[#1E513A] text-[10.5px] font-mono uppercase font-bold tracking-wider">
              0% Agent Fees
            </span>
          </div>
        </div>

        {/* Room Type Selector */}
        <div className="space-y-3 mb-6">
          <label className="block text-[10.5px] font-mono tracking-wider uppercase text-[#121212] font-semibold">
            Select Unit Type
          </label>
          <div className="space-y-2">
            {rooms.map((room) => {
              const isSelected = room.id === activeRoom?.id;
              const rent = new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
              }).format(Number(room.annualRent));

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#121212] bg-[#F8F7F4] ring-1 ring-[#121212]/15 shadow-xs"
                      : "border-[#E8E5DF] hover:border-[#121212]/40 bg-white"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="block text-xs font-semibold text-[#121212] truncate">
                      {room.label}
                    </span>
                    <span className="block text-[11px] font-mono text-[#5A5A58]">
                      2 Units Available
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#C25E38] shrink-0">
                    {rent}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenBookingModal}
          className="w-full py-4 rounded-2xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Request Free Reservation</span>
          <HiArrowRight className="w-4 h-4" />
        </button>

        {/* Assurance Ledger */}
        <div className="mt-5 pt-4 border-t border-[#E8E5DF] space-y-2 text-[11px] font-mono text-[#5A5A58]">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-4 h-4 text-[#C25E38] shrink-0" />
            <span>NIN-verified property owner</span>
          </div>
          <div className="flex items-center gap-2">
            <RiWalkLine className="w-4 h-4 text-[#1E513A] shrink-0" />
            <span>{walkMinutes} mins walk to {nearestGateName || "Campus Gate"}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineBolt className="w-4 h-4 text-[#C25E38] shrink-0" />
            <span>72-hour hold • Zero upfront payment</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Always pinned on phone screen) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] p-3.5 px-4 shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="block text-[9.5px] font-mono tracking-wider uppercase text-[#5A5A58]">
            {activeRoom?.label || "Annual Rent"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-[#121212]">
              {formattedRent}
            </span>
            <span className="text-[10px] text-[#5A5A58] font-mono">/yr</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBookingModal}
          className="h-11 px-5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-xs active:scale-[0.98] flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Request Hold</span>
          <HiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
