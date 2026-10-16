import { db } from "@/shared/db";
import { users, students, landlords } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { UpdateStudentProfileInput, UpdateLandlordProfileInput } from "./users.schema";

export class UsersRepo {
  async findUserWithProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;

    let studentProfile = null;
    let landlordProfile = null;

    if (user.role === "student") {
      const [std] = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
      studentProfile = std || null;
    } else if (user.role === "landlord") {
      const [lnd] = await db.select().from(landlords).where(eq(landlords.userId, userId)).limit(1);
      landlordProfile = lnd || null;
    }

    return { user, student: studentProfile, landlord: landlordProfile };
  }

  async updateStudentProfile(userId: string, data: UpdateStudentProfileInput) {
    return db.transaction(async (tx) => {
      const userUpdates: Record<string, any> = { updatedAt: new Date() };
      if (data.fullName) userUpdates.fullName = data.fullName;
      if (data.phone) userUpdates.phone = data.phone;

      if (Object.keys(userUpdates).length > 1) {
        await tx.update(users).set(userUpdates).where(eq(users.id, userId));
      }

      if (data.department) {
        await tx
          .update(students)
          .set({ department: data.department })
          .where(eq(students.userId, userId));
      }

      const [updatedUser] = await tx.select().from(users).where(eq(users.id, userId));
      const [updatedStudent] = await tx.select().from(students).where(eq(students.userId, userId));

      return { user: updatedUser, student: updatedStudent };
    });
  }

  async updateLandlordProfile(userId: string, data: UpdateLandlordProfileInput) {
    const userUpdates: Record<string, any> = { updatedAt: new Date() };
    if (data.fullName) userUpdates.fullName = data.fullName;
    if (data.phone) userUpdates.phone = data.phone;

    const [updatedUser] = await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, userId))
      .returning();

    const [lnd] = await db.select().from(landlords).where(eq(landlords.userId, userId)).limit(1);
    return { user: updatedUser, landlord: lnd };
  }

  async countActiveAdmins() {
    const [res] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.status, "active")));
    return Number(res?.count || 0);
  }

  /**
   * Account deletion anonymization (FR-E19 & NDPA 2023)
   * Anonymizes personal identifiable data while keeping booking rows intact
   */
  async anonymizeUser(userId: string) {
    const anonymizedEmail = `deleted_${userId}@anonymized.ulo.ng`;
    const anonymizedPhone = `+234000000${userId.substring(0, 4)}`;

    const [anonymized] = await db
      .update(users)
      .set({
        fullName: "Former User",
        email: anonymizedEmail,
        phone: anonymizedPhone,
        status: "suspended",
        passwordHash: "ANONYMIZED_ACCOUNT_HASH",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return anonymized;
  }
}

export const usersRepo = new UsersRepo();
