import { db } from "@/shared/db";
import {
  bookings,
  roomTypes,
  hostels,
  students,
  landlords,
  users,
  academicSessions,
  unitBlocks,
} from "./db";
import { eq, and, sql, inArray, lt } from "drizzle-orm";
import { RoomFullyBookedError } from "./bookings.errors";

export class BookingsRepo {
  async findBookingById(id: string) {
    const [b] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return b || null;
  }

  async findBookingWithContext(id: string) {
    const [record] = await db
      .select({
        booking: bookings,
        roomType: roomTypes,
        hostel: hostels,
        landlordUser: users,
        studentUser: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(bookings)
      .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
      .innerJoin(hostels, eq(roomTypes.hostelId, hostels.id))
      .innerJoin(landlords, eq(hostels.landlordId, landlords.userId))
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(eq(bookings.id, id))
      .limit(1);

    return record || null;
  }

  async findStudentBookings(studentId: string, opts?: { limit?: number; offset?: number }) {
    return db
      .select({
        booking: bookings,
        roomType: roomTypes,
        hostel: hostels,
        landlordUser: users,
      })
      .from(bookings)
      .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
      .innerJoin(hostels, eq(roomTypes.hostelId, hostels.id))
      .innerJoin(landlords, eq(hostels.landlordId, landlords.userId))
      .innerJoin(users, eq(landlords.userId, users.id))
      .where(eq(bookings.studentId, studentId))
      .orderBy(sql`${bookings.requestedAt} DESC`)
      .limit(opts?.limit ?? 50)
      .offset(opts?.offset ?? 0);
  }

  async findLandlordBookings(landlordId: string, opts?: { limit?: number; offset?: number }) {
    return db
      .select({
        booking: bookings,
        roomType: roomTypes,
        hostel: hostels,
        studentUser: users,
        studentProfile: students,
      })
      .from(bookings)
      .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
      .innerJoin(hostels, eq(roomTypes.hostelId, hostels.id))
      .innerJoin(students, eq(bookings.studentId, students.userId))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(hostels.landlordId, landlordId))
      .orderBy(sql`${bookings.requestedAt} DESC`)
      .limit(opts?.limit ?? 100)
      .offset(opts?.offset ?? 0);
  }

  async countStudentPending(studentId: string) {
    const [res] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(eq(bookings.studentId, studentId), eq(bookings.status, "PENDING")));
    return Number(res?.count || 0);
  }

  async hasActiveBookingForRoom(studentId: string, roomTypeId: string) {
    const [res] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.studentId, studentId),
          eq(bookings.roomTypeId, roomTypeId),
          inArray(bookings.status, ["PENDING", "APPROVED"])
        )
      )
      .limit(1);
    return !!res;
  }

  async hasApprovedBookingInSession(studentId: string, sessionId: string) {
    const [res] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.studentId, studentId),
          eq(bookings.sessionId, sessionId),
          eq(bookings.status, "APPROVED")
        )
      )
      .limit(1);
    return !!res;
  }

  async getCurrentSession() {
    const [session] = await db
      .select()
      .from(academicSessions)
      .where(eq(academicSessions.isCurrent, true))
      .limit(1);
    return session || null;
  }

  async createBooking(data: {
    studentId: string;
    roomTypeId: string;
    sessionId: string;
    rentAtRequest: string;
    studentNote?: string;
    expiresAt: Date;
  }) {
    const [newBooking] = await db
      .insert(bookings)
      .values({
        studentId: data.studentId,
        roomTypeId: data.roomTypeId,
        sessionId: data.sessionId,
        status: "PENDING",
        rentAtRequest: data.rentAtRequest,
        studentNote: data.studentNote,
        expiresAt: data.expiresAt,
      })
      .returning();

    return newBooking;
  }

  /**
   * Concurrency-safe atomic approval with SELECT ... FOR UPDATE (Section 4 & Section 6.5)
   */
  async approveBookingAtomic(bookingId: string, studentId: string, roomTypeId: string, sessionId: string, decisionNote?: string) {
    return db.transaction(async (tx) => {
      // 1. Lock the room_types row — SKIP LOCKED prevents blocking concurrent approvals
      const lockedRooms = await tx
        .select()
        .from(roomTypes)
        .where(eq(roomTypes.id, roomTypeId))
        .for("update", { skipLocked: true });

      const lockedRoom = lockedRooms[0];
      if (!lockedRoom) {
        throw new RoomFullyBookedError("Room type not found or locked by another request");
      }

      // 2+3. Single query: count approved bookings AND sum unit blocks together
      const [vacancyRow] = await tx
        .select({
          approvedCount: sql<number>`count(*) filter (where ${bookings.status} = 'APPROVED')`,
          blockedCount: sql<number>`coalesce(
            (select sum(ub.units_blocked)
             from unit_blocks ub
             where ub.room_type_id = ${roomTypeId}
               and ub.session_id = ${sessionId}),
            0
          )`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.roomTypeId, roomTypeId),
            eq(bookings.sessionId, sessionId)
          )
        );

      const approvedCount = Number(vacancyRow?.approvedCount ?? 0);
      const blockedCount = Number(vacancyRow?.blockedCount ?? 0);

      // 4. Verify vacancy
      const vacancy = lockedRoom.totalUnits - approvedCount - blockedCount;
      if (vacancy <= 0) {
        throw new RoomFullyBookedError();
      }

      // 5. Update booking status to APPROVED
      const [approvedBooking] = await tx
        .update(bookings)
        .set({
          status: "APPROVED",
          decisionNote,
          decidedAt: new Date(),
        })
        .where(and(eq(bookings.id, bookingId), eq(bookings.status, "PENDING")))
        .returning();

      if (!approvedBooking) {
        // Idempotency: double click or already expired
        const [current] = await tx.select().from(bookings).where(eq(bookings.id, bookingId));
        return { booking: current, remainingVacancy: vacancy - 1, otherPendingCancelled: 0, fullRoomAutoRejected: 0 };
      }

      // 6. FR-E3 / TC-014: Auto-cancel student's other PENDING requests in this session ("Accepted elsewhere")
      const cancelledOthers = await tx
        .update(bookings)
        .set({
          status: "CANCELLED",
          decisionNote: "Auto-cancelled: Student accepted reservation elsewhere (FR-E3)",
          decidedAt: new Date(),
        })
        .where(
          and(
            eq(bookings.studentId, studentId),
            eq(bookings.sessionId, sessionId),
            eq(bookings.status, "PENDING")
          )
        )
        .returning();

      // 7. Blueprint Section 4: If this was the last vacant unit (vacancy - 1 === 0), auto-reject remaining pending requests for this room type
      let autoRejectedCount = 0;
      if (vacancy - 1 <= 0) {
        const rejectedOthers = await tx
          .update(bookings)
          .set({
            status: "REJECTED",
            decisionNote: "No longer available (Last unit reserved)",
            decidedAt: new Date(),
          })
          .where(
            and(
              eq(bookings.roomTypeId, roomTypeId),
              eq(bookings.sessionId, sessionId),
              eq(bookings.status, "PENDING")
            )
          )
          .returning();
        autoRejectedCount = rejectedOthers.length;
      }

      return {
        booking: approvedBooking,
        remainingVacancy: vacancy - 1,
        otherPendingCancelled: cancelledOthers.length,
        fullRoomAutoRejected: autoRejectedCount,
      };
    });
  }

  async rejectBooking(bookingId: string, reason: string) {
    const [rejected] = await db
      .update(bookings)
      .set({
        status: "REJECTED",
        decisionNote: reason,
        decidedAt: new Date(),
      })
      .where(and(eq(bookings.id, bookingId), eq(bookings.status, "PENDING")))
      .returning();
    return rejected || null;
  }

  async deferBooking(bookingId: string, note: string) {
    // 6.5.7: Defer keeps request PENDING and extends expiry by 48h
    const [deferred] = await db
      .update(bookings)
      .set({
        decisionNote: note,
        expiresAt: sql`${bookings.expiresAt} + interval '48 hours'`,
      })
      .where(and(eq(bookings.id, bookingId), eq(bookings.status, "PENDING")))
      .returning();
    return deferred || null;
  }

  async cancelBooking(bookingId: string, reason?: string) {
    const [cancelled] = await db
      .update(bookings)
      .set({
        status: "CANCELLED",
        decisionNote: reason || "Cancelled by user",
        decidedAt: new Date(),
      })
      .where(inArray(bookings.status, ["PENDING", "APPROVED"]))
      .returning();
    return cancelled || null;
  }

  async expireStalePendingBookings() {
    const now = new Date();
    return db
      .update(bookings)
      .set({
        status: "EXPIRED",
        decidedAt: now,
      })
      .where(and(eq(bookings.status, "PENDING"), lt(bookings.expiresAt, now)))
      .returning();
  }
}

export const bookingsRepo = new BookingsRepo();
