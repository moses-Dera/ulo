import { db } from "@/shared/db";
import { landlords, verificationDocuments, hostels, roomTypes, bookings, unitBlocks, academicSessions } from "./db";
import { eq, inArray, and, sql } from "drizzle-orm";
import { VerificationDocumentInput } from "./landlords.schema";

export class LandlordsRepo {
  async findByUserId(userId: string) {
    const [record] = await db.select().from(landlords).where(eq(landlords.userId, userId)).limit(1);
    return record || null;
  }

  async findDocuments(landlordId: string) {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.landlordId, landlordId));
  }

  async saveVerificationSubmission(landlordId: string, docs: VerificationDocumentInput[]) {
    return db.transaction(async (tx) => {
      for (const doc of docs) {
        await tx.insert(verificationDocuments).values({
          landlordId,
          docType: doc.docType,
          storageKey: doc.storageKey,
        });
      }

      const [updated] = await tx
        .update(landlords)
        .set({
          verificationStatus: "pending",
          verificationReason: null,
        })
        .where(eq(landlords.userId, landlordId))
        .returning();

      return updated;
    });
  }

  async getCurrentSession() {
    const [session] = await db
      .select()
      .from(academicSessions)
      .where(eq(academicSessions.isCurrent, true))
      .limit(1);
    return session || null;
  }

  async findLandlordHostels(landlordId: string) {
    return db.select().from(hostels).where(eq(hostels.landlordId, landlordId));
  }

  async findRoomTypesByHostels(hostelIds: string[]) {
    if (hostelIds.length === 0) return [];
    return db.select().from(roomTypes).where(inArray(roomTypes.hostelId, hostelIds));
  }

  async findActiveBookings(roomTypeIds: string[], sessionId?: string) {
    if (roomTypeIds.length === 0) return [];
    return db
      .select({
        roomTypeId: bookings.roomTypeId,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          inArray(bookings.roomTypeId, roomTypeIds),
          sessionId ? eq(bookings.sessionId, sessionId) : sql`1=1`,
          inArray(bookings.status, ["APPROVED", "PENDING"])
        )
      );
  }

  async findActiveBlocks(roomTypeIds: string[], sessionId: string) {
    if (roomTypeIds.length === 0) return [];
    return db
      .select()
      .from(unitBlocks)
      .where(
        and(
          inArray(unitBlocks.roomTypeId, roomTypeIds),
          eq(unitBlocks.sessionId, sessionId)
        )
      );
  }
}

export const landlordsRepo = new LandlordsRepo();
