import React from "react";
import { BookingsView } from "@/components/dashboard/BookingsView";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reservations — Ụlọ | UNN Student Dashboard",
  description: "View and manage your active 72-hour UNN lodge reservations and access unlocked landlord contact details.",
};

export default function StudentBookingsPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#121212] flex flex-col justify-between">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex-1">
        <BookingsView />
      </main>
      <Footer />
    </div>
  );
}
