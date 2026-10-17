import { Suspense } from "react";
import { notFound } from "next/navigation";
import { propertiesService } from "@/modules/properties";
import { HostelDetailView } from "@/components/hostel-detail/HostelDetailView";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const hostel = await propertiesService.getHostelDetail(id);
    return {
      title: `${hostel.title} — Verified UNN Hostel | Ụlọ`,
      description: `${hostel.title} in ${hostel.zone}, Nsukka. 0% agent fees, verified ownership, real walking times to UNN gates.`,
    };
  } catch {
    return {
      title: "Hostel Details | Ụlọ",
    };
  }
}

async function HostelContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const hostel = await propertiesService.getHostelDetail(id);
    return <HostelDetailView hostel={hostel} />;
  } catch {
    notFound();
  }
}

function HostelDetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#121212] animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-5 w-40 bg-[#E8E5DF] rounded-md" />
        <div className="h-10 w-96 bg-[#E8E5DF] rounded-md" />
        <div className="h-96 w-full bg-[#EAE7E1] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-[#EAE7E1] rounded-xl" />
            <div className="h-48 bg-[#EAE7E1] rounded-xl" />
          </div>
          <div className="h-64 bg-[#EAE7E1] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function HostelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<HostelDetailSkeleton />}>
      <HostelContent params={params} />
    </Suspense>
  );
}
