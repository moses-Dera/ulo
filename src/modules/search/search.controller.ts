import { NextRequest, NextResponse } from "next/server";
import { searchService } from "./search.service";
import { searchHostelsSchema } from "./search.schema";
import { handleApiError } from "@/shared/errors";

export class SearchController {
  async search(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);

      const amenityIds = searchParams.getAll("amenityIds");

      const rawInput: Record<string, unknown> = {
        query: searchParams.get("query") || undefined,
        zone: searchParams.get("zone") || undefined,
        minRent: searchParams.get("minRent") || undefined,
        maxRent: searchParams.get("maxRent") || undefined,
        roomType: searchParams.get("roomType") || undefined,
        gateId: searchParams.get("gateId") || undefined,
        maxDistanceM: searchParams.get("maxDistanceM") || undefined,
        sort: searchParams.get("sort") || "newest",
        page: searchParams.get("page") || 1,
        limit: searchParams.get("limit") || 12,
      };

      if (amenityIds.length > 0) {
        rawInput.amenityIds = amenityIds;
      }

      const validated = searchHostelsSchema.parse(rawInput);
      const results = await searchService.search(validated);

      return NextResponse.json({ success: true, data: results });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const searchController = new SearchController();
