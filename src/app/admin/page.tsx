import { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Moderation Console — Ụlọ | UNN Nsukka",
  description: "Administrative console for auditing landlord documents, approving lodges, and platform compliance.",
};

export default function AdminPage() {
  return <AdminDashboardView />;
}
