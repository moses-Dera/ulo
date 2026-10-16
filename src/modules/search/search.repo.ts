import { db } from "@/shared/db";
import {
  hostels,
  roomTypes,
  landlords,
  users,
  hostelImages,
  hostelAmenities,
  hostelGateDistances,
  amenities,
} from "./db";
import { eq, and, sql, inArray, gte, lte, asc, desc } from "drizzle-orm";
import { SearchHostelsParsed } from "./search.schema";

export class SearchRepo {
  async searchPublishedHostels(filters: SearchHostelsParsed) {
    // 1. Base visibility conditions (PRD 6.1 / TC-008)
    const conditions = [
      eq(hostels.status, "published"),
      eq(landlords.verificationStatus, "verified"),
      eq(users.status, "active"),
    ];

    if (filters.zone) {
      conditions.push(eq(hostels.zone, filters.zone));
    }

    if (filters.query) {
      const q = `%${filters.query.trim()}%`;
      conditions.push(
        sql`(${hostels.title} ILIKE ${q} OR ${hostels.streetText} ILIKE ${q} OR ${hostels.description} ILIKE ${q})`
      );
    }

    // Filter by gate distance if gateId is supplied
    if (filters.gateId && filters.maxDistanceM) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${hostelGateDistances}
          WHERE ${hostelGateDistances.hostelId} = ${hostels.id}
          AND ${hostelGateDistances.gateId} = ${filters.gateId}
          AND ${hostelGateDistances.distanceM} <= ${filters.maxDistanceM}
        )`
      );
    }

    // Filter by amenities (multi-select)
    if (filters.amenityIds && filters.amenityIds.length > 0) {
      for (const aId of filters.amenityIds) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${hostelAmenities}
            WHERE ${hostelAmenities.hostelId} = ${hostels.id}
            AND ${hostelAmenities.amenityId} = ${aId}
          )`
        );
      }
    }

    // Filter by price range
    if (filters.minRent !== undefined) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${roomTypes}
          WHERE ${roomTypes.hostelId} = ${hostels.id}
          AND ${roomTypes.isHidden} = false
          AND ${roomTypes.annualRent} >= ${filters.minRent}
        )`
      );
    }

    if (filters.maxRent !== undefined) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${roomTypes}
          WHERE ${roomTypes.hostelId} = ${hostels.id}
          AND ${roomTypes.isHidden} = false
          AND ${roomTypes.annualRent} <= ${filters.maxRent}
        )`
      );
    }

    // Filter by room type label
    if (filters.roomType) {
      const rtQ = `%${filters.roomType.trim()}%`;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${roomTypes}
          WHERE ${roomTypes.hostelId} = ${hostels.id}
          AND ${roomTypes.isHidden} = false
          AND ${roomTypes.label} ILIKE ${rtQ}
        )`
      );
    }

    // 2. Count total matches
    const countQuery = await db
      .select({ count: sql<number>`count(distinct ${hostels.id})` })
      .from(hostels)
      .innerJoin(landlords, eq(hostels.landlordId, landlords.userId))
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(and(...conditions));

    const total = Number(countQuery[0]?.count || 0);

    // 3. Pagination & Sorting
    const offset = (filters.page - 1) * filters.limit;

    let orderByClause = desc(hostels.createdAt);
    if (filters.sort === "newest") {
      orderByClause = desc(hostels.createdAt);
    }

    const matchedHostels = await db
      .select({
        id: hostels.id,
        title: hostels.title,
        zone: hostels.zone,
        streetText: hostels.streetText,
        walkTimeBand: hostels.walkTimeBand,
        landlordVerification: landlords.verificationStatus,
      })
      .from(hostels)
      .innerJoin(landlords, eq(hostels.landlordId, landlords.userId))
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(filters.limit)
      .offset(offset);

    if (matchedHostels.length === 0) {
      return { items: [], total };
    }

    const hostelIds = matchedHostels.map((h) => h.id);

    // Fetch primary images, room types, and amenities for these matched hostels
    const [images, rooms, hostelAms, gateDists] = await Promise.all([
      db
        .select()
        .from(hostelImages)
        .where(inArray(hostelImages.hostelId, hostelIds)),
      db
        .select()
        .from(roomTypes)
        .where(and(inArray(roomTypes.hostelId, hostelIds), eq(roomTypes.isHidden, false))),
      db
        .select({
          hostelId: hostelAmenities.hostelId,
          name: amenities.name,
        })
        .from(hostelAmenities)
        .innerJoin(amenities, eq(hostelAmenities.amenityId, amenities.id))
        .where(inArray(hostelAmenities.hostelId, hostelIds)),
      filters.gateId
        ? db
            .select()
            .from(hostelGateDistances)
            .where(
              and(
                inArray(hostelGateDistances.hostelId, hostelIds),
                eq(hostelGateDistances.gateId, filters.gateId)
              )
            )
        : Promise.resolve([]),
    ]);

    const results = matchedHostels.map((h) => {
      const hImages = images.filter((img) => img.hostelId === h.id);
      const primaryImg = hImages.find((img) => img.isPrimary) || hImages[0];
      const hRooms = rooms.filter((r) => r.hostelId === h.id);
      const hAmenities = hostelAms.filter((a) => a.hostelId === h.id).map((a) => a.name);
      const hGateDist = gateDists.find((gd) => gd.hostelId === h.id);

      const rents = hRooms.map((r) => parseFloat(r.annualRent));
      const minRent = rents.length > 0 ? Math.min(...rents) : 0;
      const maxRent = rents.length > 0 ? Math.max(...rents) : 0;

      return {
        id: h.id,
        title: h.title,
        zone: h.zone,
        streetText: h.streetText,
        walkTimeBand: h.walkTimeBand,
        minRent,
        maxRent,
        roomTypeLabels: hRooms.map((r) => r.label),
        primaryImage: primaryImg?.storageKey || null,
        primaryImageThumb: primaryImg?.thumbKey || null,
        distanceToSelectedGateM: hGateDist?.distanceM,
        amenities: hAmenities,
        isVerifiedLandlord: h.landlordVerification === "verified",
      };
    });

    // In-memory sort adjustments if sorting by price
    if (filters.sort === "price_asc") {
      results.sort((a, b) => a.minRent - b.minRent);
    } else if (filters.sort === "price_desc") {
      results.sort((a, b) => b.minRent - a.minRent);
    } else if (filters.sort === "distance" && filters.gateId) {
      results.sort((a, b) => (a.distanceToSelectedGateM || 99999) - (b.distanceToSelectedGateM || 99999));
    }

    return { items: results, total };
  }
}

export const searchRepo = new SearchRepo();
