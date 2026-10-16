import React from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { DashboardFooter } from "@/components/layout/DashboardFooter";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      <DashboardNav role="student" />
      <main className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  );
}
