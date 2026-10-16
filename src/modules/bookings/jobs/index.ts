import { bookingsRepo } from "../bookings.repo";
import { emitBookingExpired } from "../bookings.events";
import { logger } from "@/shared/logger";

export async function runBookingExpiryJob(): Promise<{ expiredCount: number }> {
  logger.info("[BookingExpiryJob] Checking for stale pending requests (> 72 hours)", "BookingExpiryJob");
  const expiredBookings = await bookingsRepo.expireStalePendingBookings();

  for (const b of expiredBookings) {
    await emitBookingExpired({
      bookingId: b.id,
      studentId: b.studentId,
    });
  }

  logger.info(`[BookingExpiryJob] Expired ${expiredBookings.length} stale booking requests`, "BookingExpiryJob");
  return { expiredCount: expiredBookings.length };
}
