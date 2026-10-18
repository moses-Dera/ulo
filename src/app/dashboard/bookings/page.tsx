import React from "react";
import { BookingsView } from "@/components/dashboard/BookingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reservations — Ụlọ | UNN Student Dashboard",
  description: "View and manage your active 72-hour UNN lodge reservations and access unlocked landlord contact details.",
};

export default function StudentBookingsPage() {
  return <BookingsView />;
}
