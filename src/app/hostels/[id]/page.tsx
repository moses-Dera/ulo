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

export default async function HostelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const hostel = await propertiesService.getHostelDetail(id);
    return <HostelDetailView hostel={hostel} />;
  } catch (err) {
    notFound();
  }
}
