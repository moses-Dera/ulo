"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiCheckCircle, HiShieldCheck } from "react-icons/hi2";
import { RiBuildingLine, RiTimeLine } from "react-icons/ri";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostelId: string;
  hostelTitle: string;
  selectedRoom: {
    id: string;
    label: string;
    annualRent: number | string;
  };
}

export function BookingModal({
  isOpen,
  onClose,
  hostelId,
  hostelTitle,
  selectedRoom,
}: BookingModalProps) {
  const [studentName, setStudentName] = useState("Emeka Okafor");
  const [regNumber, setRegNumber] = useState("2021/248190");
  const [department, setDepartment] = useState("Electronic Engineering");
  const [phone, setPhone] = useState("08034567890");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [studentNote, setStudentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  const formattedRent = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(selectedRoom.annualRent));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostelId,
          roomTypeId: selectedRoom.id,
          academicSession,
          studentNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit reservation. Please try again.");
      }

      setSuccessBookingId(data.data?.id || "BK-" + Date.now().toString().slice(-6));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#121212]/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8E5DF] shadow-2xl p-6 sm:p-8 z-10 my-8 text-left"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-[#5A5A58] hover:text-[#121212] p-2 rounded-xl hover:bg-[#F9F8F6] transition-colors cursor-pointer"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            {successBookingId ? (
              /* Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF3EE] text-[#1E513A] flex items-center justify-center mx-auto">
                  <HiCheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#1E513A] font-semibold">
                    Reservation Held • 72 Hours
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#121212]">
                    Request Sent to Landlord!
                  </h3>
                  <p className="text-sm text-[#5A5A58] max-w-sm mx-auto">
                    Your spot in <strong className="text-[#121212]">{hostelTitle}</strong> has been locked in the queue. The landlord has 72 hours to approve your reservation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#E8E5DF] text-xs font-mono space-y-1.5 text-left">
                  <div className="flex justify-between text-[#5A5A58]">
                    <span>Booking Ref:</span>
                    <span className="font-bold text-[#121212]">{successBookingId}</span>
                  </div>
                  <div className="flex justify-between text-[#5A5A58]">
                    <span>Room Type:</span>
                    <span className="font-bold text-[#121212]">{selectedRoom.label}</span>
                  </div>
                  <div className="flex justify-between text-[#5A5A58]">
                    <span>Annual Rent:</span>
                    <span className="font-bold text-[#C25E38]">{formattedRent} / session</span>
                  </div>
                  <div className="flex justify-between text-[#5A5A58]">
                    <span>Agent Commission:</span>
                    <span className="font-bold text-[#1E513A]">₦0 (0% Fee)</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href="/dashboard/bookings"
                    className="w-full py-3.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all text-center"
                  >
                    Track in Student Dashboard
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-xs font-mono text-[#5A5A58] hover:text-[#121212] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form State */
              <div>
                <div className="mb-5">
                  <span className="text-[10.5px] font-mono tracking-widest uppercase text-[#C25E38] font-semibold block mb-1">
                    Free Reservation Request
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#121212]">
                    {hostelTitle}
                  </h3>
                  <div className="mt-2 flex items-center justify-between p-3 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-xs">
                    <span className="font-medium text-[#121212]">{selectedRoom.label}</span>
                    <span className="font-mono font-bold text-[#C25E38]">{formattedRent} / yr</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                        UNN Reg Number
                      </label>
                      <input
                        type="text"
                        required
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
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
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                      Target Academic Session
                    </label>
                    <select
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs font-medium text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212]"
                    >
                      <option value="2025/2026">2025/2026 Academic Session</option>
                      <option value="2026/2027">2026/2027 Academic Session</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A5A58] mb-1 font-semibold">
                      Note to Landlord (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={studentNote}
                      onChange={(e) => setStudentNote(e.target.value)}
                      placeholder="e.g. 300L student, quiet, seeking prompt move-in next month."
                      className="w-full px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#DCD8D0] text-xs text-[#121212] focus:bg-white focus:outline-none focus:border-[#121212] resize-none"
                    />
                  </div>

                  {/* Safety Policy Notice */}
                  <div className="p-3 rounded-xl bg-[#FAF2EE] border border-[#C25E38]/20 flex items-start gap-2.5">
                    <HiShieldCheck className="w-4 h-4 text-[#C25E38] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#5A5A58] leading-tight">
                      <strong className="text-[#121212] font-semibold">Ụlọ Safety Guarantee:</strong> Never transfer rent before a physical inspection. Your booking request holds the room for 72 hours with 0% agent fees.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-[#121212] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Holding Room..." : "Submit Free Reservation Request"}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
