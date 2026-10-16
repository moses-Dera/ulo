import { LandingView } from "@/components/landing/LandingView";
import { searchService } from "@/modules/search";
import { LodgeItem } from "@/components/landing/LodgeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialLodges: LodgeItem[] = [];

  try {
    const { results } = await searchService.search({ page: 1, limit: 12 });

    if (results && results.length > 0) {
      initialLodges = results.map((item, index) => {
        // Fallback images rotate across our 3 generated authentic assets
        const fallbackImages = [
          "/images/lodge_st_judes.jpg",
          "/images/lodge_interior.jpg",
          "/images/lodge_nest.jpg",
        ];
        const assignedImage = item.primaryImageUrl || fallbackImages[index % fallbackImages.length];
        const closestGate = item.gateDistances?.[0];
        const walkingMinutes = closestGate ? Math.max(2, Math.round(closestGate.distanceM / 75)) : 4;

        return {
          id: item.id,
          name: item.title,
          zone: item.zone,
          gateProximity: closestGate?.gateName || "Second Gate",
          walkingMinutes,
          minRent: item.minRent,
          roomType: item.roomTypes?.[0]?.name || "Self-Contain",
          availableUnits: item.availableUnitsCount,
          totalUnits: item.totalUnitsCount,
          imageUrl: assignedImage,
          isVerifiedLandlord: item.isVerifiedLandlord,
          amenities: item.amenities || ["Borehole Water", "Standby Power", "Fenced"],
        };
      });
    }
  } catch (err) {
    // If database is cold or empty, LandingView gracefully defaults to curated verified lodges
    console.warn("[LandingPage] Note: Using curated seed lodges", (err as Error).message);
  }

  return <LandingView initialLodges={initialLodges} />;
}
