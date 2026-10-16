import { bookingsRepo } from "./bookings.repo";
import { BookingsPolicy } from "./bookings.policy";
import { BookingsMapper } from "./bookings.mapper";
import {
  BookingNotFoundError,
  DuplicateActiveBookingError,
  MaxPendingBookingsExceededError,
  RoomFullyBookedError,
  AlreadyApprovedInSessionError,
  InvalidBookingStateTransitionError,
} from "./bookings.errors";
import {
  emitBookingRequested,
  emitBookingApproved,
  emitBookingRejected,
  emitBookingCancelled,
} from "./bookings.events";
import { mailer } from "@/shared/mail/mailer";
import { config } from "@/shared/config";
import {
  RequestBookingInput,
  ApproveBookingInput,
  RejectBookingInput,
  DeferBookingInput,
  CancelBookingInput,
} from "./bookings.schema";
import { propertiesRepo } from "../properties/properties.repo";
import { NotFoundError } from "@/shared/errors";

export class BookingsService {
  async requestBooking(studentId: string, actorRole: string, data: RequestBookingInput) {
    BookingsPolicy.assertStudentCanRequest(actorRole);

    const currentSession = await bookingsRepo.getCurrentSession();
    if (!currentSession) {
      throw new NotFoundError("No active academic session found");
    }

    // 1. Check if student already holds an approved booking for this academic session (TC-014)
    const hasApproved = await bookingsRepo.hasApprovedBookingInSession(studentId, currentSession.id);
    if (hasApproved) {
      throw new AlreadyApprovedInSessionError();
    }

    // 2. Check if student already has an active (PENDING or APPROVED) request for this room type (TC-007)
    const hasActive = await bookingsRepo.hasActiveBookingForRoom(studentId, data.roomTypeId);
    if (hasActive) {
      throw new DuplicateActiveBookingError();
    }

    // 3. Check student concurrent pending cap (Max 3 per Q4 / FR-S4)
    const pendingCount = await bookingsRepo.countStudentPending(studentId);
    if (pendingCount >= config.limits.maxStudentPendingBookings) {
      throw new MaxPendingBookingsExceededError();
    }

    // 4. Verify room exists and has vacancy
    const room = await propertiesRepo.findRoomTypeById(data.roomTypeId);
    if (!room || room.isHidden) {
      throw new RoomFullyBookedError("This room type is currently unavailable");
    }

    const { totalOccupied } = await propertiesRepo.countApprovedBookingsAndBlocks(
      data.roomTypeId,
      currentSession.id
    );
    if (room.totalUnits - totalOccupied <= 0) {
      throw new RoomFullyBookedError();
    }

    // 5. Create reservation with 72-hour expiry timer
    const expiresAt = new Date(Date.now() + config.limits.bookingExpiryHours * 60 * 60 * 1000);

    const newBooking = await bookingsRepo.createBooking({
      studentId,
      roomTypeId: data.roomTypeId,
      sessionId: currentSession.id,
      rentAtRequest: room.annualRent, // Lock rent at request per FR-E4
      studentNote: data.studentNote,
      expiresAt,
    });

    // 6. Emit event and alert landlord
    await emitBookingRequested({
      bookingId: newBooking.id,
      studentId,
      hostelId: room.hostelId,
      roomTypeId: room.id,
    });

    return newBooking;
  }

  async approveBooking(bookingId: string, actorId: string, actorRole: string, data: ApproveBookingInput) {
    const context = await bookingsRepo.findBookingWithContext(bookingId);
    if (!context) {
      throw new BookingNotFoundError();
    }

    // IDOR protection: Landlord A cannot approve Landlord B's booking (TC-009)
    BookingsPolicy.assertLandlordCanDecide(context.hostel.landlordId, actorId, actorRole);

    if (context.booking.status !== "PENDING") {
      throw new InvalidBookingStateTransitionError();
    }

    // Atomic execution with SELECT ... FOR UPDATE (TC-006 / Section 4)
    const result = await bookingsRepo.approveBookingAtomic(
      bookingId,
      context.booking.studentId,
      context.booking.roomTypeId,
      context.booking.sessionId,
      data.decisionNote
    );

    await emitBookingApproved({
      bookingId,
      studentId: context.booking.studentId,
      roomTypeId: context.booking.roomTypeId,
      landlordId: context.hostel.landlordId,
    });

    // Notify student via email with UNLOCKED landlord details (TC-005)
    mailer.sendMail({
      to: context.studentUser.email,
      subject: `Reservation Approved: ${context.hostel.title}`,
      html: `
        <p>Congratulations <strong>${context.studentUser.fullName}</strong>!</p>
        <p>Your room reservation for <strong>${context.roomType.label}</strong> at <strong>${context.hostel.title}</strong> has been <strong>APPROVED</strong> by the landlord.</p>
        <div style="background: #F9F8F6; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #E5E3DF;">
          <h4 style="margin-top: 0; color: #121212;">Unlocked Landlord Contact Details</h4>
          <p><strong>Landlord Name:</strong> ${context.landlordUser.fullName}</p>
          <p><strong>Phone:</strong> <a href="tel:${context.landlordUser.phone}">${context.landlordUser.phone}</a></p>
          <p><strong>Exact Lodge Address:</strong> ${context.hostel.exactAddress}</p>
          ${context.hostel.mapsUrl ? `<p><a href="${context.hostel.mapsUrl}" target="_blank">Open in Google Maps</a></p>` : ""}
        </div>
        <p style="color: #C25E38; font-weight: bold;">Remember: Never pay rent before you physically inspect the room in person.</p>
      `,
    });

    return result;
  }

  async rejectBooking(bookingId: string, actorId: string, actorRole: string, data: RejectBookingInput) {
    const context = await bookingsRepo.findBookingWithContext(bookingId);
    if (!context) {
      throw new BookingNotFoundError();
    }

    BookingsPolicy.assertLandlordCanDecide(context.hostel.landlordId, actorId, actorRole);

    if (context.booking.status !== "PENDING") {
      throw new InvalidBookingStateTransitionError();
    }

    const rejected = await bookingsRepo.rejectBooking(bookingId, data.reason);

    await emitBookingRejected({
      bookingId,
      studentId: context.booking.studentId,
      reason: data.reason,
    });

    mailer.sendMail({
      to: context.studentUser.email,
      subject: `Reservation Decision: ${context.hostel.title}`,
      html: `
        <p>Hello <strong>${context.studentUser.fullName}</strong>,</p>
        <p>Your reservation request for ${context.hostel.title} was not approved.</p>
        <p><strong>Reason provided:</strong> ${data.reason}</p>
        <p>You can browse other available lodges in Behind Flat, Hilltop, and Odim Gate on Ụlọ.</p>
      `,
    });

    return rejected;
  }

  async deferBooking(bookingId: string, actorId: string, actorRole: string, data: DeferBookingInput) {
    const context = await bookingsRepo.findBookingWithContext(bookingId);
    if (!context) {
      throw new BookingNotFoundError();
    }

    BookingsPolicy.assertLandlordCanDecide(context.hostel.landlordId, actorId, actorRole);

    if (context.booking.status !== "PENDING") {
      throw new InvalidBookingStateTransitionError();
    }

    return bookingsRepo.deferBooking(bookingId, data.decisionNote);
  }

  async cancelBooking(bookingId: string, actorId: string, actorRole: string, data: CancelBookingInput) {
    const context = await bookingsRepo.findBookingWithContext(bookingId);
    if (!context) {
      throw new BookingNotFoundError();
    }

    BookingsPolicy.assertCanCancel(context.booking.studentId, actorId, actorRole);

    const cancelled = await bookingsRepo.cancelBooking(bookingId, data.reason);

    await emitBookingCancelled({
      bookingId,
      studentId: context.booking.studentId,
      roomTypeId: context.booking.roomTypeId,
    });

    return cancelled;
  }

  async getStudentBookings(studentId: string) {
    const records = await bookingsRepo.findStudentBookings(studentId);
    return records.map((r) =>
      BookingsMapper.toDto({
        booking: r.booking,
        roomType: r.roomType,
        hostel: r.hostel,
        landlordUser: r.landlordUser,
      })
    );
  }

  async getLandlordBookings(landlordId: string) {
    return bookingsRepo.findLandlordBookings(landlordId);
  }
}

export const bookingsService = new BookingsService();
