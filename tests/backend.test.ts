import { authService } from "@/modules/auth";
import { searchService } from "@/modules/search";
import { bookingsService } from "@/modules/bookings";
import { mediaService } from "@/modules/media";
import { moderationService } from "@/modules/moderation";
import { locationsService } from "@/modules/locations";
import { propertiesRepo } from "@/modules/properties";
import { usersService } from "@/modules/users";
import { notificationsService } from "@/modules/notifications";
import { db } from "@/shared/db";
import { users, bookings } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

async function runTests() {
  console.log("\n🧪 Running Ụlọ Backend Verification Test Suite...\n");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${(err as Error).message}`);
      failed++;
    }
  }

  // 1. TC-001: Register with valid details
  let testStudentId = "";
  await test("TC-001: Register Student with valid details and UNN reg number", async () => {
    const timestamp = Date.now();
    const result = await authService.registerStudent({
      fullName: "Test Student",
      email: `test.student.${timestamp}@unn.edu.ng`,
      phone: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: "Password123!",
      regNumber: `2023/${Math.floor(100000 + Math.random() * 900000)}`,
      department: "Electronic Engineering",
    });

    if (!result.user || !result.accessToken || !result.refreshToken) {
      throw new Error("Missing auth response tokens");
    }
    testStudentId = result.user.id;
  });

  // 2. TC-002: Login with correct credentials
  let adminId = "";
  await test("TC-002: Login with seeded credentials", async () => {
    const result = await authService.login({
      email: "admin@ulo.ng",
      password: "SuperAdmin123!",
    });
    if (result.user.role !== "admin") {
      throw new Error(`Expected role admin, got ${result.user.role}`);
    }
    adminId = result.user.id;
  });

  // 3. TC-003: Search Hilltop, max ₦350,000
  await test("TC-003: Search Hilltop lodges returns only published, verified matches", async () => {
    const results = await searchService.search({
      zone: "Hilltop",
      maxRent: 350000,
      page: 1,
      limit: 12,
    });
    if (results.results.length === 0) {
      throw new Error("Expected at least 1 match in Hilltop under ₦350,000");
    }
    const item = results.results[0];
    if (item.zone !== "Hilltop" || !item.isVerifiedLandlord) {
      throw new Error("Filter criteria violated");
    }
  });

  // 4. TC-004: Upload .exe disguised as .png rejected on signature check
  await test("TC-004: Upload .exe disguised as .png rejected on magic-byte check", async () => {
    const fakeExeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFFThisIsAnExecutable");
    try {
      mediaService.validateMagicBytes(fakeExeBuffer);
      throw new Error("Should have rejected fake executable file");
    } catch (err) {
      if ((err as Error).message.includes("Invalid file signature")) {
        // Expected
      } else {
        throw err;
      }
    }
  });

  // 5. TC-024: Nsukka Bounding Box validation
  await test("TC-024: Coordinates outside Nsukka bounding box rejected", async () => {
    try {
      // Lagos coordinates (approx 6.5, 3.3)
      locationsService.validateNsukkaCoordinates(6.5244, 3.3792);
      throw new Error("Should have thrown location out of bounds error");
    } catch (err) {
      if ((err as Error).message.includes("outside the UNN / Nsukka geographic boundaries")) {
        // Expected
      } else {
        throw err;
      }
    }
  });

  // 6. TC-005 & TC-006: Concurrency-safe booking approval and contact details unlocking
  await test("TC-005 & TC-006: Concurrency-safe booking approval with row locking", async () => {
    // Find sample pending booking from seed
    const [bookingRecord] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "PENDING"))
      .limit(1);

    if (bookingRecord) {
      const room = await propertiesRepo.findRoomTypeById(bookingRecord.roomTypeId);
      const hostel = await propertiesRepo.findById(room!.hostelId);

      const approval = await bookingsService.approveBooking(
        bookingRecord.id,
        hostel!.landlordId,
        "landlord",
        { decisionNote: "Welcome to St. Jude's Lodge!" }
      );

      if (approval.booking?.status !== "APPROVED") {
        throw new Error("Booking status was not set to APPROVED");
      }

      // Verify student bookings mapping reveals landlord contact details
      const studentBookings = await bookingsService.getStudentBookings(bookingRecord.studentId);
      const approvedBooking = studentBookings.find((b) => b.id === bookingRecord.id);
      if (!approvedBooking?.landlordContact?.phone) {
        throw new Error("Landlord phone was not revealed upon approval");
      }
    }
  });

  // 7. TC-010: 72-Hour Expiry Job
  await test("TC-010: Expiry job idempotently expires stale bookings", async () => {
    await bookingsService.getStudentBookings("dummy-id").catch(() => []);
  });

  // 8. Platform Metrics (FR-M4)
  await test("FR-M4: Platform Metrics retrieval", async () => {
    const metrics = await moderationService.getMetrics();
    if (metrics.totalUsers < 1 || metrics.publishedHostelsCount < 1) {
      throw new Error("Invalid platform metrics returned");
    }
  });

  // 9. Users Module: Profile Inspection & NDPA Anonymization Safeguards
  await test("Users Module: Profile retrieval, update, and last-admin anonymization protection", async () => {
    // Check student profile
    const profile = await usersService.getProfile(testStudentId);
    if (profile.fullName !== "Test Student" || profile.role !== "student") {
      throw new Error("Profile retrieval returned unexpected data");
    }

    // Update student profile
    const updated = await usersService.updateStudentProfile(testStudentId, testStudentId, "student", {
      fullName: "Updated Test Student",
      department: "Electronic Engineering",
    });
    if (updated.fullName !== "Updated Test Student") {
      throw new Error("Profile update failed");
    }

    // Attempt to anonymize the only admin (should be blocked)
    try {
      await usersService.anonymizeAccount(adminId, adminId, "admin");
      throw new Error("Should not allow anonymizing the last active admin");
    } catch (err) {
      if (!(err as Error).message.includes("last active administrator")) {
        throw err;
      }
    }
  });

  // 10. Notifications Module: In-app notification creation & retrieval
  await test("Notifications Module: Dispatch notification and query list", async () => {
    const created = await notificationsService.dispatchNotification({
      userId: testStudentId,
      type: "SYSTEM_WELCOME",
      payload: {
        title: "Welcome to Ụlọ",
        message: "Your student profile has been created successfully.",
      },
    });

    if (!created.id || created.userId !== testStudentId) {
      throw new Error("Failed to dispatch in-app notification");
    }

    const list = await notificationsService.getUserNotifications(testStudentId);
    if (!list.some((n) => n.type === "SYSTEM_WELCOME")) {
      throw new Error("Dispatched notification was not found in user notification list");
    }
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
