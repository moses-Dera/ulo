import { Metadata } from "next";
import { LandlordDashboardView } from "@/components/landlord/LandlordDashboardView";

export const metadata: Metadata = {
  title: "Landlord Console — Ụlọ | UNN Student Accommodation",
  description: "Manage UNN campus student reservation holds, approve vetted students, and track compound vacancy.",
};

export default function LandlordDashboardPage() {
  return <LandlordDashboardView />;
}
