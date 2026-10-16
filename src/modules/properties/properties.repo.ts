import { db } from "@/shared/db";
import {
  hostels,
  roomTypes,
  unitBlocks,
  hostelAmenities,
  hostelGateDistances,
  hostelImages,
  amenities,
  campusGates,
  bookings,
  academicSessions,
} from "./db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { CreateHostelInput, UpdateHostelInput, CreateRoomTypeInput, UpdateRoomTypeInput } from "./properties.schema";

export class PropertiesRepo {
  async findById(id: string) {
    const [hostel] = await db.select().from(hostels).where(eq(hostels.id, id)).limit(1);
    return hostel || null;
  }

  async findHostelFullDetails(id: string) {
    const [hostel] = await db.select().from(hostels).where(eq(hostels.id, id)).limit(1);
    if (!hostel) return null;

    const [rooms, images, hostAmenities, gateDists] = await Promise.all([
      db.select().from(roomTypes).where(eq(roomTypes.hostelId, id)),
      db.select().from(hostelImages).where(eq(hostelImages.hostelId, id)),
      db
        .select({ id: amenities.id, name: amenities.name })
        .from(hostelAmenities)
        .innerJoin(amenities, eq(hostelAmenities.amenityId, amenities.id))
        .where(eq(hostelAmenities.hostelId, id)),
      db
        .select({
          gateId: campusGates.id,
          gateName: campusGates.name,
          distanceM: hostelGateDistances.distanceM,
        })
        .from(hostelGateDistances)
        .innerJoin(campusGates, eq(hostelGateDistances.gateId, campusGates.id))
        .where(eq(hostelGateDistances.hostelId, id)),
    ]);

    let nearestGateName: string | undefined;
    if (hostel.nearestGateId) {
      const [gate] = await db
        .select({ name: campusGates.name })
        .from(campusGates)
        .where(eq(campusGates.id, hostel.nearestGateId))
        .limit(1);
      nearestGateName = gate?.name;
    }

    return {
      hostel,
      rooms,
      images,
      amenities: hostAmenities,
      gateDistances: gateDists,
      nearestGateName,
    };
  }

  async createHostel(landlordId: string, data: CreateHostelInput) {
    return db.transaction(async (tx) => {
      const [newHostel] = await tx
        .insert(hostels)
        .values({
          landlordId,
          title: data.title,
          description: data.description,
          rules: data.rules,
          zone: data.zone,
          streetText: data.streetText,
          exactAddress: data.exactAddress,
          nearestGateId: data.nearestGateId,
          walkTimeBand: data.walkTimeBand,
          latitude: data.latitude ? data.latitude.toString() : null,
          longitude: data.longitude ? data.longitude.toString() : null,
          mapsUrl: data.mapsUrl || null,
          status: "draft",
        })
        .returning();

      if (data.amenityIds && data.amenityIds.length > 0) {
        await tx.insert(hostelAmenities).values(
          data.amenityIds.map((aId) => ({
            hostelId: newHostel.id,
            amenityId: aId,
          }))
        );
      }

      return newHostel;
    });
  }

  async updateHostel(id: string, data: UpdateHostelInput) {
    const updateValues: Record<string, any> = { updatedAt: new Date() };

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.description !== undefined) updateValues.description = data.description;
    if (data.rules !== undefined) updateValues.rules = data.rules;
    if (data.zone !== undefined) updateValues.zone = data.zone;
    if (data.streetText !== undefined) updateValues.streetText = data.streetText;
    if (data.exactAddress !== undefined) updateValues.exactAddress = data.exactAddress;
    if (data.nearestGateId !== undefined) updateValues.nearestGateId = data.nearestGateId;
    if (data.walkTimeBand !== undefined) updateValues.walkTimeBand = data.walkTimeBand;
    if (data.latitude !== undefined) updateValues.latitude = data.latitude ? data.latitude.toString() : null;
    if (data.longitude !== undefined) updateValues.longitude = data.longitude ? data.longitude.toString() : null;
    if (data.mapsUrl !== undefined) updateValues.mapsUrl = data.mapsUrl || null;

    const [updated] = await db.update(hostels).set(updateValues).where(eq(hostels.id, id)).returning();
    return updated;
  }

  async setHostelStatus(id: string, status: "draft" | "pending_review" | "published" | "rejected" | "suspended", reviewReason?: string) {
    const [updated] = await db
      .update(hostels)
      .set({
        status,
        reviewReason: reviewReason ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hostels.id, id))
      .returning();
    return updated;
  }

  async setGateDistances(hostelId: string, distances: Array<{ gateId: string; distanceM: number }>) {
    await db.delete(hostelGateDistances).where(eq(hostelGateDistances.hostelId, hostelId));
    if (distances.length > 0) {
      await db.insert(hostelGateDistances).values(
        distances.map((d) => ({
          hostelId,
          gateId: d.gateId,
          distanceM: d.distanceM,
        }))
      );
    }
  }

  async findRoomTypeById(id: string) {
    const [rt] = await db.select().from(roomTypes).where(eq(roomTypes.id, id)).limit(1);
    return rt || null;
  }

  async createRoomType(hostelId: string, data: CreateRoomTypeInput) {
    const [rt] = await db
      .insert(roomTypes)
      .values({
        hostelId,
        label: data.label,
        annualRent: data.annualRent.toFixed(2),
        totalUnits: data.totalUnits,
        description: data.description,
      })
      .returning();
    return rt;
  }

  async updateRoomType(id: string, data: UpdateRoomTypeInput) {
    const updateValues: Record<string, any> = {};
    if (data.label !== undefined) updateValues.label = data.label;
    if (data.annualRent !== undefined) updateValues.annualRent = data.annualRent.toFixed(2);
    if (data.totalUnits !== undefined) updateValues.totalUnits = data.totalUnits;
    if (data.isHidden !== undefined) updateValues.isHidden = data.isHidden;
    if (data.description !== undefined) updateValues.description = data.description;

    const [updated] = await db.update(roomTypes).set(updateValues).where(eq(roomTypes.id, id)).returning();
    return updated;
  }

  async deleteRoomType(id: string) {
    await db.delete(roomTypes).where(eq(roomTypes.id, id));
  }

  async countApprovedBookingsAndBlocks(roomTypeId: string, sessionId: string) {
    const approved = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.roomTypeId, roomTypeId),
          eq(bookings.sessionId, sessionId),
          eq(bookings.status, "APPROVED")
        )
      );

    const blocks = await db
      .select({ sum: sql<number>`coalesce(sum(${unitBlocks.unitsBlocked}), 0)` })
      .from(unitBlocks)
      .where(
        and(
          eq(unitBlocks.roomTypeId, roomTypeId),
          eq(unitBlocks.sessionId, sessionId)
        )
      );

    const approvedCount = Number(approved[0]?.count || 0);
    const blockedCount = Number(blocks[0]?.sum || 0);

    return { approvedCount, blockedCount, totalOccupied: approvedCount + blockedCount };
  }

  async countHostelImages(hostelId: string) {
    const imgs = await db.select().from(hostelImages).where(eq(hostelImages.hostelId, hostelId));
    const roomPhotos = imgs.filter((i) => i.tag === "room");
    return {
      total: imgs.length,
      roomCount: roomPhotos.length,
    };
  }

  async getCurrentSession() {
    const [session] = await db
      .select()
      .from(academicSessions)
      .where(eq(academicSessions.isCurrent, true))
      .limit(1);
    return session || null;
  }
}

export const propertiesRepo = new PropertiesRepo();
