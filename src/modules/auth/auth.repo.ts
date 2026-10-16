import { db } from "@/shared/db";
import { users, students, landlords, bannedIdentifiers } from "./db";
import { eq, or } from "drizzle-orm";

export class AuthRepo {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return user || null;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  async findByPhone(phone: string) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone.trim())).limit(1);
    return user || null;
  }

  async checkEmailOrPhoneExists(email: string, phone: string) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email.toLowerCase().trim()), eq(users.phone, phone.trim())))
      .limit(1);
    return !!user;
  }

  async checkRegNumberExists(regNumber: string) {
    const [student] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.regNumber, regNumber.trim().toUpperCase()))
      .limit(1);
    return !!student;
  }

  async checkBannedIdentifier(identifier: string) {
    const [record] = await db
      .select({ id: bannedIdentifiers.id })
      .from(bannedIdentifiers)
      .where(eq(bannedIdentifiers.identifierValue, identifier.trim()))
      .limit(1);
    return !!record;
  }

  async createStudentUser(userData: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone: string;
    regNumber: string;
    department: string;
  }) {
    return db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: userData.email.toLowerCase().trim(),
          passwordHash: userData.passwordHash,
          role: "student",
          fullName: userData.fullName.trim(),
          phone: userData.phone.trim(),
          status: "active",
          emailVerifiedAt: new Date(),
        })
        .returning();

      await tx.insert(students).values({
        userId: newUser.id,
        regNumber: userData.regNumber.trim().toUpperCase(),
        department: userData.department.trim(),
      });

      return newUser;
    });
  }

  async createLandlordUser(userData: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone: string;
  }) {
    return db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: userData.email.toLowerCase().trim(),
          passwordHash: userData.passwordHash,
          role: "landlord",
          fullName: userData.fullName.trim(),
          phone: userData.phone.trim(),
          status: "active",
          emailVerifiedAt: new Date(),
        })
        .returning();

      await tx.insert(landlords).values({
        userId: newUser.id,
        verificationStatus: "unsubmitted",
      });

      return newUser;
    });
  }

  async updatePassword(userId: string, newPasswordHash: string) {
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const authRepo = new AuthRepo();
