import { db } from "@/shared/db";
import {
  landlords,
  verificationDocuments,
  hostels,
  users,
  students,
  bookings,
  listingReports,
  roomTypes,
} from "./db";
import { eq, and, sql, inArray, desc } from "drizzle-orm";

export class ModerationRepo {
  async findPendingVerifications() {
    const list = await db
      .select({
        landlord: landlords,
        user: users,
      })
      .from(landlords)
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(eq(landlords.verificationStatus, "pending"));

    const landlordIds = list.map((l) => l.landlord.userId);

    const docs = landlordIds.length > 0
      ? await db
          .select()
          .from(verificationDocuments)
          .where(inArray(verificationDocuments.landlordId, landlordIds))
      : [];

    return list.map((item) => ({
      landlordId: item.landlord.userId,
      fullName: item.user.fullName,
      email: item.user.email,
      phone: item.user.phone,
      status: item.landlord.verificationStatus,
      documents: docs.filter((d) => d.landlordId === item.landlord.userId),
    }));
  }

  async setLandlordVerification(
    landlordId: string,
    status: "verified" | "rejected",
    reason?: string,
    adminId?: string
  ) {
    const [updated] = await db
      .update(landlords)
      .set({
        verificationStatus: status,
        verificationReason: reason || null,
        verifiedBy: adminId || null,
        verifiedAt: status === "verified" ? new Date() : null,
      })
      .where(eq(landlords.userId, landlordId))
      .returning();

    // If revoked/rejected, unpublish landlord's hostels (FR-6.3)
    if (status === "rejected") {
      await db
        .update(hostels)
        .set({ status: "suspended", reviewReason: "Landlord verification revoked by admin" })
        .where(eq(hostels.landlordId, landlordId));
    }

    return updated;
  }

  async findPendingListings() {
    return db
      .select({
        hostel: hostels,
        landlordName: users.fullName,
        landlordEmail: users.email,
      })
      .from(hostels)
      .innerJoin(landlords, eq(hostels.landlordId, landlords.userId))
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(eq(hostels.status, "pending_review"))
      .orderBy(desc(hostels.updatedAt));
  }

  async setHostelModeration(
    hostelId: string,
    status: "published" | "rejected" | "suspended",
    reason?: string
  ) {
    const [updated] = await db
      .update(hostels)
      .set({
        status,
        reviewReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(hostels.id, hostelId))
      .returning();

    return updated;
  }

  async countActiveAdmins() {
    const [res] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.status, "active")));
    return Number(res?.count || 0);
  }

  async setUserStatus(userId: string, status: "active" | "suspended") {
    const [updated] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    // TC-011: Suspending a landlord unpublishes their listings and cancels their pending requests
    if (updated.role === "landlord" && status === "suspended") {
      await db
        .update(hostels)
        .set({ status: "suspended", reviewReason: "Owner account suspended by administration" })
        .where(eq(hostels.landlordId, userId));

      // Cancel pending requests for their hostels
      const landlordHostels = await db
        .select({ id: hostels.id })
        .from(hostels)
        .where(eq(hostels.landlordId, userId));

      const hostelIds = landlordHostels.map((h) => h.id);
      if (hostelIds.length > 0) {
        const rooms = await db
          .select({ id: roomTypes.id })
          .from(roomTypes)
          .where(inArray(roomTypes.hostelId, hostelIds));

        const roomIds = rooms.map((r) => r.id);
        if (roomIds.length > 0) {
          await db
            .update(bookings)
            .set({
              status: "CANCELLED",
              decisionNote: "Cancelled: Landlord account suspended",
              decidedAt: new Date(),
            })
            .where(
              and(inArray(bookings.roomTypeId, roomIds), eq(bookings.status, "PENDING"))
            );
        }
      }
    }

    return updated;
  }

  /**
   * Records a listing report.
   * Auto-hides listing if 3 reports from distinct users are reached (TC-019 / FR-E7)
   */
  async submitReport(hostelId: string, reporterUserId: string, reason: string, note?: string) {
    await db.insert(listingReports).values({
      hostelId,
      reporterUserId,
      reason,
      note,
    });

    const [countResult] = await db
      .select({ count: sql<number>`count(distinct ${listingReports.reporterUserId})` })
      .from(listingReports)
      .where(eq(listingReports.hostelId, hostelId));

    const distinctReports = Number(countResult?.count || 0);

    let autoHidden = false;
    if (distinctReports >= 3) {
      // Auto-hide listing pending admin review
      await db
        .update(hostels)
        .set({
          status: "suspended",
          reviewReason: "Auto-hidden: 3 distinct student fraud/safety reports received (TC-019)",
          updatedAt: new Date(),
        })
        .where(eq(hostels.id, hostelId));
      autoHidden = true;
    }

    return { distinctReports, autoHidden };
  }

  async getPlatformMetrics() {
    const [totalUsersRes] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [studentsRes] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [landlordsRes] = await db.select({ count: sql<number>`count(*)` }).from(landlords);
    const [verifiedLandlordsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(landlords)
      .where(eq(landlords.verificationStatus, "verified"));

    const [publishedHostelsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hostels)
      .where(eq(hostels.status, "published"));

    const [pendingListingsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(hostels)
      .where(eq(hostels.status, "pending_review"));

    const [totalBookingsRes] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [approvedBookingsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "APPROVED"));

    const zoneCounts = await db
      .select({
        zone: hostels.zone,
        count: sql<number>`count(*)`,
      })
      .from(hostels)
      .where(eq(hostels.status, "published"))
      .groupBy(hostels.zone);

    const hostelsByZone: Record<string, number> = {};
    for (const z of zoneCounts) {
      hostelsByZone[z.zone] = Number(z.count);
    }

    const totalB = Number(totalBookingsRes?.count || 0);
    const approvedB = Number(approvedBookingsRes?.count || 0);
    const approvalRatePercentage = totalB > 0 ? Math.round((approvedB / totalB) * 100) : 0;

    return {
      totalUsers: Number(totalUsersRes?.count || 0),
      studentsCount: Number(studentsRes?.count || 0),
      landlordsCount: Number(landlordsRes?.count || 0),
      verifiedLandlordsCount: Number(verifiedLandlordsRes?.count || 0),
      publishedHostelsCount: Number(publishedHostelsRes?.count || 0),
      pendingListingsCount: Number(pendingListingsRes?.count || 0),
      totalBookings: totalB,
      approvedBookings: approvedB,
      approvalRatePercentage,
      hostelsByZone,
    };
  }
}

export const moderationRepo = new ModerationRepo();
