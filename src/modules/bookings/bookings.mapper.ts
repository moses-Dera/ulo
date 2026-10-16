import { BookingDto } from "./bookings.dto";
import { bookings, roomTypes, hostels, users } from "./db";

type BookingRow = typeof bookings.$inferSelect;
type RoomTypeRow = typeof roomTypes.$inferSelect;
type HostelRow = typeof hostels.$inferSelect;
type UserRow = typeof users.$inferSelect;

export class BookingsMapper {
  static toDto(data: {
    booking: BookingRow;
    roomType: RoomTypeRow;
    hostel: HostelRow;
    landlordUser?: UserRow;
  }): BookingDto {
    const isApproved = data.booking.status === "APPROVED";

    return {
      id: data.booking.id,
      studentId: data.booking.studentId,
      roomTypeId: data.booking.roomTypeId,
      roomTypeLabel: data.roomType.label,
      hostelId: data.hostel.id,
      hostelTitle: data.hostel.title,
      hostelZone: data.hostel.zone,
      status: data.booking.status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED",
      rentAtRequest: data.booking.rentAtRequest,
      studentNote: data.booking.studentNote,
      decisionNote: data.booking.decisionNote,
      requestedAt: data.booking.requestedAt,
      decidedAt: data.booking.decidedAt,
      expiresAt: data.booking.expiresAt,
      // Landlord contact unlocked ONLY when approved
      landlordContact:
        isApproved && data.landlordUser
          ? {
              name: data.landlordUser.fullName,
              phone: data.landlordUser.phone,
              email: data.landlordUser.email,
              exactAddress: data.hostel.exactAddress,
              mapsUrl: data.hostel.mapsUrl,
            }
          : undefined,
    };
  }
}
