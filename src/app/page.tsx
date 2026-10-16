import { LandingView } from "@/components/landing/LandingView";
import { searchService } from "@/modules/search";
import { LodgeItem } from "@/components/landing/LodgeCard";

export const instant = false;

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
        const assignedImage = item.primaryImage || fallbackImages[index % fallbackImages.length];
        const walkingMinutes = item.walkTimeBand ? parseInt(item.walkTimeBand.split("-")[0], 10) || 4 : 4;

        return {
          id: item.id,
          name: item.title,
          zone: item.zone,
          gateProximity: item.zone === "Behind Flat" ? "Second Gate" : item.zone === "Hilltop" ? "Hilltop Gate" : "Odim Gate",
          walkingMinutes,
          minRent: item.minRent,
          roomType: item.roomTypeLabels?.[0] || "Self-Contain",
          availableUnits: item.totalAvailableUnits ?? 2,
          totalUnits: (item.totalAvailableUnits ?? 2) + 6,
          imageUrl: assignedImage,
          isVerifiedLandlord: item.isVerifiedLandlord,
          amenities: item.amenities && item.amenities.length > 0 ? item.amenities : ["Borehole Water", "Standby Power", "Fenced"],
        };
      });
    }
  } catch (err) {
    // If database is cold or empty, LandingView gracefully defaults to curated verified lodges
    console.warn("[LandingPage] Note: Using curated seed lodges", (err as Error).message);
  }

  return <LandingView initialLodges={initialLodges} />;
}
